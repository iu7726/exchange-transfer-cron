import { OkPacket } from "mysql2";
import SQL from "sql-template-strings";
import Model from "./classes/Model";
import axios from "axios";
import ConnectionPool from "libs-connection-pool";

export default class WithdrawModel extends Model {
  
  async getApprovedWithdraw(): Promise<LogWithdraw[]> {
    try {
      const sql = SQL`
        SELECT
          id,
          account_id as accountId,
          to_address,
          asset,
          fee,
          network,
          dest,
          amount,
          address_tag
        FROM
          log_withdraw
        WHERE
          state = 'approved'
        ORDER BY
          created_at ASC;
        `;
        
        return await this.connection.readerQuery(sql);
    } catch (e) {
      console.log(e)
    }

    return []
  }
  async setProcessingWithdraw(id: string): Promise<boolean> {
    try {
      const sql = SQL`
      UPDATE log_withdraw SET state = 'Processing' WHERE id = ${id};
      `

      await this.connection.writerQuery(sql);

      return true
    } catch (e) {
      console.log(e)
    }

    return false
  }

  async setCompletedWithdraw(id: string): Promise<boolean> {
    try {
      const sql = SQL`
      UPDATE log_withdraw SET state = 'complete' WHERE id = ${id};
      `

      await this.connection.writerQuery(sql);

      return true
    } catch (e) {
      console.log(e)
    }

    return false
  }

  async setReviewWithdraw(id: string): Promise<boolean> {
    try {
      const sql = SQL`
      UPDATE log_withdraw SET state = 'review', is_manual = true WHERE id = ${id};
      `

      await this.connection.writerQuery(sql);

      return true
    } catch (e) {
      console.log(e)
    }

    return false
  }

  async setRejectWithdraw(id: string): Promise<boolean> {
    try {
      const sql = SQL`
      UPDATE log_withdraw SET state = 'reject' WHERE id = ${id};
      `

      await this.connection.writerQuery(sql);

      return true
    } catch (e) {
      console.log(e)
    }

    return false
  }

  async setOnChainData(info: any): Promise<boolean> {
    try {
      const sql = SQL`
      UPDATE log_withdraw
      SET
        tx_id = ${info.txId},
        wd_id = ${info.wdId},
        raw = ${info.raw},
        state= ${info.state},
        from_address = ${info.from}
      WHERE
        id = ${info.id}
      `;
      
      await this.connection.writerQuery(sql)

      return true
    } catch (e) {
      console.log(e)
    }

    return false;
  }
}