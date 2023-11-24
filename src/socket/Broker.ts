import { logger } from "../util/Logger";
import { OKX } from "./okx/okx";
import { WebSocket } from "ws"
import { ModelManager, useModel } from "../models";
import ConnectionPool from "libs-connection-pool";
import { RedisClientType, RedisClusterType } from "redis";
import { AMQModule } from "amqmodule";

let broker: Broker;
let socket: WebSocket;
let health: number = 0;
let pingInterval: NodeJS.Timer;
export const useBroker = () => {
  return broker
}

export const connect = () => {
  console.log("Connecting Start...")
  socket = new WebSocket('wss://ws.okx.com:8443/ws/v5/business/')
  socket.onopen = function (e) {
    health = 0;
    console.log("Successfully connected to the WebSocket.");
    
    // OKX Master Broker Login
    const loginParams = broker.okx.login()
    send(loginParams)

    setTimeout(() => {
      // subscribe
      const sub_param = {"op": "subscribe", "args": [{"channel": "deposit-info"}, {"channel": "withdrawal-info"}]}
      const sub_str = JSON.stringify(sub_param)
      send(sub_str)
    }, 500)

    // Ping Pong
    pingInterval = setInterval(() => {
      socket.ping(() => {})
    }, 25000);
  }

  socket.onclose = function (e) {
    clearInterval(pingInterval);
    if (health === 3) {
      //TODO: process write when this socket stop 

    } else {
      health++;
    }
    console.log("WebSocket connection closed unexpectedly. Trying to reconnect in 2s...");
    setTimeout(function () {
      console.log("Reconnecting...");
      connect();
    }, 2000);
  };

  socket.onmessage = async function (e: any) {
    const data = JSON.parse(e.data);
    
    if (data.event && data.event == 'subscribe') {
      console.log(data)
      return;
    }

    if ( ! data.arg) return;

    const info: OKXDeposit = data;

    if (info.arg.channel == 'deposit-info') {
      depositExec(info);
    }

    if (info.arg.channel == 'withdrawal-info') {
      console.log(data);
      setOnChainWithdraw(data.data)
    }
  };

  socket.onerror = function (err: any) {
    console.log(err)
    console.log("WebSocket encountered an error: " + err.message);
    console.log("Closing the socket.");
    socket.close();
  }
}

export const send = (value: string) => {
  if (typeof value != 'string') value = JSON.stringify(value);

  socket.send(value);
}

export class Broker {
  okx: OKX
  model: ModelManager
  redis: RedisClientType | RedisClusterType
  mq: AMQModule<any>

  constructor(model: ModelManager, redis: RedisClientType | RedisClusterType, mq: AMQModule<any>) {
    this.okx = new OKX()
    this.model = model;
    this.redis = redis;
    this.mq = mq;
    broker = this; 
  }

  public brokerConnect = () => {
    this.redis.connect()
    return connect()
  }

}

export const depositExec = async (info: OKXDeposit) => {
  try {
    const alertObj: {[key: string]: number} = {
      SEVERE: 4, 
      HIGH: 3, 
      MEDIUM: 2,
      LOW:1,
      NONE: 0
    }

    for (let i = 0; i < info.data.length; i++) {
      const infoData = info.data[i];
      
      const account = await broker.model.account.getAccountIdByOKXUid(infoData.uid)
      
      if ( ! account) {
        // TODO: Logging not user
        return;
      }
      const priceRes = await broker.redis.HGET('$USDT:price$', infoData.ccy)

      let amountEq = "0"
      let price = 1
      if (priceRes) {
        if (infoData.ccy != 'USDT') {
          price = (JSON.parse(priceRes)).price
        }
        
        amountEq = (Number(price) * Number(infoData.amt)).toString()
      }

      let state = "pending"

      const internalCheck = infoData.fromWdId != ""
      
      if (internalCheck) {
        console.log('internal deposit')
        state = "approved"
      }
  
      // deposit log create
      broker.model.deposit.createLog({
        accountId: account.id,
        address: infoData.to,
        okxUid: infoData.uid,
        asset: infoData.ccy,
        network: infoData.chain,
        amount: infoData.amt,
        amountEq: amountEq,
        depId: infoData.depId,
        state: state,
        txId: infoData.txId,
        raw: JSON.stringify(infoData)
      })

      console.log('deposit', infoData)

      if (infoData.state != '2') {
        console.log(infoData.depId, infoData.state, 'pending')
        return;
      }

      if (internalCheck) {
        return;
      }
      
  
      const selectNetwork = broker.model.network.getNetwork(infoData.chain)

      if ( ! selectNetwork) {
        console.log('select out')
        return;
      }
  
      const depositInfo: ChainalysisDepositDTO = {
        network: selectNetwork, 
        asset: infoData.ccy, 
        transferReference: infoData.txId,
        direction: 'received'
      }
      const chainalysisRes: ChainalysisAlert = await broker.model.chainalysis.alertDeposit(`OgUser${account.userId}`, depositInfo)
      console.log('chainalysis', chainalysisRes)
      if (chainalysisRes.alerts.length == 0) {
        // TODO: Auto Metic TransferCode
        if (infoData.state == '2') {
          console.log(chainalysisRes, 'no alert and excuted auto metic transfercode')
          broker.model.deposit.setApprovedDeposit(infoData.depId)
          // broker.model.brokerAPI.automaticDeposit({depId: infoData.depId})
        } else if (infoData.state != '0') {
          // TODO: OKX Deposit Stop Alert
          console.log(infoData)
        }
        
      } else {
        const alerts = chainalysisRes.alerts
        
        let highAlert = 'NONE'
        const insertAlert: LogDepositAlert[] = []
        for (let i = 0; i < alerts.length; i++) {
          const alert = alerts[i]
          // TODO: save
          console.log(alert)

          if (alertObj[highAlert] < alertObj[alert.alertLevel]) {
            highAlert = alert.alertLevel
          }
  
          insertAlert.push({
            id: alert.externalId + '_' + alert.categoryId + '_' + i,
            accountId: account.id,
            depId: infoData.depId,
            okxUid: infoData.uid,
            alertLevel: alert.alertLevel,
            categoryId: alert.categoryId,
            category: alert.category,
            service: alert.service,
            amount: alert.alertAmount,
            raw: JSON.stringify(alert)
          })
          
        }
        
        if (insertAlert.length > 0) {
          await broker.model.deposit.createAlertLog(insertAlert);
          
          broker.mq.publish(String(process.env.MQ_MAIL_REVIEW), {
            id: infoData.depId,
            userId: account.userId
          })
          // TODO: lark send?
        }
        
      }
    }
  } catch (e) {
    console.error('Deposit Exec Error', e)
  }
}

export const setOnChainWithdraw = async (data: any) => {
  try {
    for (let i = 0 ; i < data.length; i++) {
      const info = data[i];
  
      if (info.txId) {
        const setParam = {
          id: info.clientId,
          txId: info.txId,
          wdId: info.wdId,
          state: 'complete',
          from: info.from,
          raw: JSON.stringify(info)
        }
    
        broker.model.withdraw.setOnChainData(setParam)
        // broker.model.withdraw.setCompletedWithdraw(info.clientId)
    
        broker.mq.publish(String(process.env.MQ_MAIL_WITHDRAW_COMPLETE), {
          id: info.clientId
        })
      } 
    }
  } catch (e) {
    console.log("set onchain withdraw error", e)
  }
  
}
