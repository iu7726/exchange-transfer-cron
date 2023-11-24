import { Job, JobRequest, JobResult } from "libs-job-manager";
import { ModelManager, useModel } from "../models";
import { logger } from "../util/Logger";
import moment from "moment";
import axios from "axios";
import { decrypt } from "../util/Fernet";
import fs from "fs"
import { depositExec } from "../socket/Broker";

export interface WithdrawJobRequest extends JobRequest { }

export interface WithdrawJobResult extends JobResult { }

export class WithdrawJob extends Job<WithdrawJobRequest, WithdrawJobResult> {
  constructor(jobRequest: WithdrawJobRequest, private readonly model: ModelManager) {
    super(jobRequest);
  }

  async execute(): Promise<WithdrawJobResult> {
    try {
      const list = await this.model.withdraw.getApprovedWithdraw()
      console.log('withdraw list', list)
      if (list.length == 0) return {success: true}
      
      for (let i = 0; i < list.length; i++) {
        const approve = list[i]

        const user = await this.model.account.getAccountId(approve.accountId)

        if ( ! user) continue;

        const walletKey = await this.model.kms.decrypt(user.walletKey ?? "")
        const walletSecret = await this.model.kms.decrypt(user.walletSecret ?? "")
        const passphrase = await decrypt(user.tag ?? "", String(process.env.FERNET_KEY))

        if ( ! walletKey || ! walletSecret) continue;

        const permission = await this.model.account.getPermission(approve.accountId, 'withdraw')

        if (permission) {
          await this.model.withdraw.setReviewWithdraw(approve.id)
          continue;
        }
        
        let toAddr = approve.to_address

        if (approve.address_tag) {
          toAddr += ':' + approve.address_tag
        }

        const withdrawRes = await this.model.okx.withdrawExec(
          walletKey,
          walletSecret,
          passphrase,
          {
            ccy: approve.asset,
            amt: approve.amount,
            dest: approve.dest,
            toAddr: toAddr,
            fee: approve.fee,
            chain: approve.network,
            clientId: approve.id
          }
        )

        console.log(withdrawRes)
        if (withdrawRes.code == '0') {
          this.model.withdraw.setCompletedWithdraw(approve.id)
        } else if (withdrawRes.code == '58222') {
          console.log('Withdraw Failed Invalied Balance Return')
          this.model.withdraw.setRejectWithdraw(approve.id)
          await this.model.okx.transferExec(
            walletKey,
            walletSecret,
            passphrase,
            {
              ccy: approve.asset,
              amt: (Number(approve.amount) + Number(approve.fee)).toString(),
              from_:"6",
              to:"18"
            }
          )
        }

      }

      return {
        success: true,
      };
    } catch (err) {
      logger.log("[Balance Job]", err);
      return {
        success: false,
      };
    }
  }
}
