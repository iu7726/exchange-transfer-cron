import DelayApiModel from "./classes/DelayApiModel";

export default class BrokerAPIModel extends DelayApiModel {

  async automaticDeposit(data: any): Promise<void> {
    const url = 'https://dev.api.exchange.og.xyz/broker/transfer/deposit'

    const headers = {
      Authorization: `Bearer `,
      'X-Auth-Base': `Token `,
      'X-Auth-Access': ''
    }

    this.POST<any>(url, data, headers, 0);
  }

}