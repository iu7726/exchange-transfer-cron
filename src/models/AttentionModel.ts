import { OkPacket } from "mysql2";
import SQL from "sql-template-strings";
import Model from "./classes/Model";
import axios from "axios";
import ConnectionPool from "libs-connection-pool";

export default class AttentionModel extends Model {
  
  async createLog(record: TransactionAttentionDTO): Promise<boolean> {
    try {
      const sql = SQL`
        INSERT INTO transcation_attention 
          (
            account_id,
            user_id,
            type,
            dep_id,
            wd_id,
            wd_request_id,
            alert_level,
            state,
            created_at,
            updated_at
          )
        VALUES
          (
            ${record.accountId},
            ${record.userId},
            ${record.type},
            ${record.depId},
            ${record.wdId},
            ${record.wdRequestId},
            ${record.alertLevel},
            ${record.state},
            ${new Date()},
            ${new Date()}
          )
        ON DUPLICATE KEY UPDATE
        updated_at = VALUES(updated_at)
        `;
        
        await this.connection.writerQuery(sql);

        return true
    } catch (e) {
      console.log(e)
    }

    return false
  }
}