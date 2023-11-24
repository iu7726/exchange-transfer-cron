import { OkPacket } from "mysql2";
import SQL from "sql-template-strings";
import Model from "./classes/Model";
import axios from "axios";
import ConnectionPool from "libs-connection-pool";

export default class DepositModel extends Model {
  
  async createLog(record: LogDeposit): Promise<boolean> {
    try {
      const sql = SQL`
        INSERT INTO log_deposit 
          (
            account_id,
            address,
            okx_uid,
            asset,
            network,
            amount,
            amount_eq,
            dep_id,
            state,
            raw,
            tx_id,
            is_manual,
            created_at
          )
        VALUES
          (
            ${record.accountId},
            ${record.address},
            ${record.okxUid},
            ${record.asset},
            ${record.network},
            ${record.amount},
            ${record.amountEq},
            ${record.depId},
            ${record.state},
            ${record.raw},
            ${record.txId},
            false,
            ${new Date()}
          )
        ON DUPLICATE KEY UPDATE
        raw = VALUES(raw)
        `;
        
        await this.connection.writerQuery(sql);

        return true
    } catch (e) {
      console.log(e)
    }

    return false
  }

  async createAlertLog(records: LogDepositAlert[]) {
    try {
      const sql = `
        INSERT INTO log_deposit_alert 
          (
            id,
            dep_id,
            account_id,
            okx_uid,
            alert_level,
            category,
            service,
            amount,
            category_id,
            raw,
            created_at
          )
        VALUES
          ?
        ON DUPLICATE KEY UPDATE
          raw = VALUES(raw)
        `;
        const param = [
          records.map((record:LogDepositAlert) => [
            record.id,
            record.depId, 
            record.accountId,
            record.okxUid, 
            record.alertLevel,
            record.category,
            record.service,
            record.amount,
            record.categoryId,
            record.raw,
            new Date()
          ])
        ];
        
        await this.connection.writerQuery(sql, param);

        return true
    } catch (e) {
      console.log(e)
    }

    return false
  }

  async setApprovedDeposit(depId:string) {
    try {
      const sql = SQL`
      UPDATE log_deposit SET state = 'approved' WHERE dep_id = ${depId}
      `

      await this.connection.writerQuery(sql)
    } catch (e) {
      console.log(e)
    }
  }

  async getDepositLastes(): Promise<any> {
    try {
      const sql = SQL`
      SELECT 
        depId
      FROM
        log_deposit
      ORDER BY
        created_at DESC
      LIMIT 1
      `

      return await this.connection.readerQuerySingle(sql)
    } catch (e) {
      console.log(e)
    }
  }

  async getApprovedDeposit(): Promise<LogDeposit[]> {
    try {
      const sql = SQL`
        SELECT
          dep_id as depId,
          account_id as accountId,
          asset,
          amount
        FROM
          log_deposit
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

  async setProcessingDeposit(depId: string): Promise<boolean> {
    try {
      const sql = SQL`
      UPDATE log_deposit SET state = 'processing' WHERE dep_id = ${depId};
      `

      await this.connection.writerQuery(sql);

      return true
    } catch (e) {
      console.log(e)
    }

    return false
  }

  async setCompletedDeposit(depId: string): Promise<boolean> {
    try {
      const sql = SQL`
      UPDATE log_deposit SET state = 'complete' WHERE dep_id = ${depId};
      `

      await this.connection.writerQuery(sql);

      return true
    } catch (e) {
      console.log(e)
    }

    return false
  }

  async setReviewDeposit(depId: string): Promise<boolean> {
    try {
      const sql = SQL`
      UPDATE log_deposit SET state = 'review', is_manual = true WHERE dep_id = ${depId};
      `

      await this.connection.writerQuery(sql);

      return true
    } catch (e) {
      console.log(e)
    }

    return false
  }
}