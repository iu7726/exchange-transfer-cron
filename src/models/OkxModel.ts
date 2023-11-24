import DelayApiModel from "./classes/DelayApiModel";
import { computeHmac, fromBase64Url } from "../util/Fernet";
import * as crypto from "crypto"

export default class OkxModel extends DelayApiModel {
    async getHeader(path:string, access: string, secret: string, passphrase:string) {
        const timestamp = new Date().toISOString();
        
        const input = `${timestamp}${path}`
        
        const sign = crypto.createHmac('SHA256', Buffer.from(secret))
        .update(Buffer.from(input))
        .digest('base64')

        return {
            'OK-ACCESS-KEY': access,
            'OK-ACCESS-SIGN': sign,
            'OK-ACCESS-TIMESTAMP': timestamp,
            'OK-ACCESS-PASSPHRASE': passphrase,
            'x-simulated-trading': '0'
        }
    }

    async getDepositHistory() {
        const url = `https://www.okx.com/api/v5/asset/broker/nd/subaccount-deposit-history`;

        try {
            const header = await this.getHeader(
                'GET/api/v5/asset/broker/nd/subaccount-deposit-history',
                String(process.env.OKEX_BROKER_KEY),
                String(process.env.OKEX_BROKER_SECRET_KEY),
                String(process.env.OKEX_BROKER_PASSPHRASE)
            )
            
            const response = await this.GET<any>(url,0, header);
            
            if (response) {

                return response;

            }

        } catch (e) {
            console.log('E', e);
        }

        return undefined;
    }

    async withdrawExec(access: string, secret: string, pass:string, withdrawParam: OKXWithdraw) {
        const url = `https://www.okx.com/api/v5/asset/withdrawal`;
        console.log(access, secret, pass, withdrawParam)
        try {
            const header = await this.getHeader(
                `POST/api/v5/asset/withdrawal${JSON.stringify(withdrawParam)}`,
                access,
                secret,
                pass
            ) 
            
            const response = await this.POST<any>(url,withdrawParam, header, 0);
            
            if (response) {

                return response;

            }

        } catch (e) {
            console.log('E', e);
        }

        return undefined;
    }

    async transferExec(access: string, secret: string, pass:string, transferParam: OKXTransfer) {
        const url = `https://www.okx.com/api/v5/asset/transfer`;
        try {
            const header = await this.getHeader(
                `POST/api/v5/asset/transfer${JSON.stringify(transferParam)}`,
                access,
                secret,
                pass
            ) 
            
            const response = await this.POST<any>(url,transferParam, header, 0);
            
            if (response) {

                return response;

            }

        } catch (e) {
            console.log('E', e);
        }

        return undefined;
    }

}