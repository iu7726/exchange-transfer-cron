import { Job, JobRequest, JobResult } from "libs-job-manager";
import { ModelManager, useModel } from "../models";
import { logger } from "../util/Logger";
import moment from "moment";
import axios from "axios";
import { decrypt } from "../util/Fernet";
import fs from "fs"
import { depositExec } from "../socket/Broker";
import { AMQModule } from "amqmodule";

export interface DepositJobRequest extends JobRequest {
  mq: AMQModule<any>
 }

export interface DepositJobResult extends JobResult { }

export class DepositJob extends Job<DepositJobRequest, DepositJobResult> {
  constructor(jobRequest: DepositJobRequest, private readonly model: ModelManager) {
    super(jobRequest);
  }

  async execute(): Promise<DepositJobResult> {
    try {
      const list = await this.model.deposit.getApprovedDeposit()
      
      if (list.length == 0) return {success: true}
      
      for (let i = 0; i < list.length; i++) {
        const approve = list[i]

        const user = await this.model.account.getAccountId(approve.accountId)

        if ( ! user) continue;

        const walletKey = await this.model.kms.decrypt(user.walletKey ?? "")
        const walletSecret = await this.model.kms.decrypt(user.walletSecret ?? "")
        const passphrase = await decrypt(user.tag ?? "", String(process.env.FERNET_KEY))

        if ( ! walletKey || ! walletSecret) continue;

        const permission = await this.model.account.getPermission(approve.accountId, 'deposit')

        if (permission) {
          await this.model.deposit.setReviewDeposit(approve.depId)
          continue;
        }

        const res = await this.model.okx.transferExec(
          walletKey,
          walletSecret,
          passphrase,
          {
            ccy: approve.asset,
            amt: approve.amount,
            from_:"6",
            to:"18"
          }
        )
        
        if (res.code == '0') {
          this.model.deposit.setCompletedDeposit(approve.depId)

          this.request.mq.publish(String(process.env.MQ_MAIL_DEPOSIT), {
            userId: user.userId,
            depId: approve.depId
          })

          if (user.isDeposit == false) {
            this.model.account.setAccountIsDeposit(user.id)
          }
        }

      }

      return {
        success: true,
      };
    } catch (err) {
      logger.log("[Deposit Job]", err);
      return {
        success: false,
      };
    }
  }
}
