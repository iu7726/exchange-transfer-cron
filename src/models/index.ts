import ConnectionPool from "libs-connection-pool";
import DepositModel from "./DepositModel";
import ChainalysisModel from "./ChainalysisModel";
import NetworkModel from "./NetworkModel";
import AccountModel from "./AccountModel";
import AttentionModel from "./AttentionModel";
import BrokerAPIModel from "./BrokerAPIModel";
import OkxModel from "./OkxModel";
import WithdrawModel from "./WithdrawModel";
import KMSModel from "./KMSModel";

export class ModelManager {

  deposit: DepositModel
  withdraw: WithdrawModel
  chainalysis: ChainalysisModel
  network: NetworkModel
  account: AccountModel
  attention: AttentionModel
  brokerAPI: BrokerAPIModel
  okx: OkxModel
  kms: KMSModel

  constructor(connection: ConnectionPool) {
    this.deposit = new DepositModel(connection);
    this.withdraw = new WithdrawModel(connection);
    this.chainalysis = new ChainalysisModel(0);
    this.network = new NetworkModel()
    this.account = new AccountModel(connection)
    this.attention = new AttentionModel(connection)
    this.brokerAPI = new BrokerAPIModel(0)
    this.okx = new OkxModel(0)
    this.kms = new KMSModel()
  }
}

let modelManager: ModelManager;

export const useModel = (connection: ConnectionPool) => {
  if (modelManager == undefined) {
    modelManager = new ModelManager(connection);
  }
  return modelManager;
};
