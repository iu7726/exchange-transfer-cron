import dotenv from "dotenv";
import ConnectionPool from "libs-connection-pool";
import Cron from "node-cron";

import { AsyncJobManager } from "./managers/AsyncJobManager";
import { SyncJobWithEmitManager } from "./managers/SyncJobWithEmitManager";
import { useModel } from "./models";
import { initLogger, logger } from "./util/Logger";

import { Broker } from "./socket/Broker";

import { RedisClientType, RedisClusterType, createClient, createCluster } from 'redis';
import { WithdrawJob } from "./jobs/WithdrawJob";
import { DepositJob } from "./jobs/DepositJob";

import { createJsonTypeInstance } from 'amqmodule';

dotenv.config();

(async () => {
  initLogger("exchange transfer cron");

  const cp = new ConnectionPool({
    host: String(process.env.DATABASE_HOST),
    writerHost: String(process.env.DATABASE_HOST),
    readerHost: String(process.env.DATABASE_RO_HOST),
    user: String(process.env.DATABASE_USER),
    password: String(process.env.DATABASE_PASSWORD),
    database: String(process.env.DATABASE_DATABASE),
  });

  const model = useModel(cp);
  const redis: RedisClientType | RedisClusterType = process.env.REDIS_CLUSTER == "true"
    ? createCluster({ rootNodes: [{ url: process.env.REDIS_URL }] })
    : createClient({ url: process.env.REDIS_URL })
  logger.load("cp connect complete...");

  const mqInstance = await createJsonTypeInstance({
    host: String(process.env.MQ_HOST),
    id: String(process.env.MQ_ID),
    pw: String(process.env.MQ_PW),
    port: parseInt(String(process.env.MQ_PORT))
  })
  mqInstance.setExchange(String(process.env.MQ_EXCHANGE))

  const syncJobManager = new SyncJobWithEmitManager(() => {

  });


  const asyncJobManager = new AsyncJobManager();

  Cron.schedule('* * * * *', () => {
    logger.info("job time")
    asyncJobManager.addJob(new WithdrawJob({}, model))
    asyncJobManager.addJob(new DepositJob({ mq: mqInstance }, model))
  })
  logger.info("Socket Connecting...")
  const broker = new Broker(model, redis, mqInstance);
  broker.brokerConnect();
  const ttt = await broker.redis.HGET('$USDT:price$', 'MATIC')
  console.log(ttt, (JSON.parse(ttt ?? '{}')).price)

  logger.info("Load Completed")

})();
