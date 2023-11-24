import DelayApiModel from "./classes/DelayApiModel";
import { computeHmac, fromBase64Url } from "../util/Fernet";
import * as crypto from "crypto"

export default class ChainalysisModel extends DelayApiModel {
  async registerReceived(subAcct: string, depositDTO: ChainalysisDepositDTO): Promise<string | undefined> {
    const url = `https://api.chainalysis.com/api/kyt/v2/users/${subAcct}/transfers`;

    const headers = {
      'Token': process.env.CHAINALYSIS_KEY,
      'Content-type': 'application/json'
    }

    const res = await this.POST<ChainalysisDepositRegister>(url, depositDTO, headers, 0)

    return res?.externalId
  }

  async alertDeposit(subAcct: string, depositDTO: ChainalysisDepositDTO) {
    const externalId = await this.registerReceived(subAcct, depositDTO);

    if ( ! externalId ) return undefined;

    const url = `https://api.chainalysis.com/api/kyt/v2/transfers/${externalId}/alerts`;

    try {
      const headers = {
        'Token': process.env.CHAINALYSIS_KEY,
        'Accept': 'application/json',
      }

      const response = await this.GET<any>(url, 0, headers)

      if (response) {
        return response
      }
    } catch (e) {
      console.log('E', e)
    }

    return undefined
  }

}