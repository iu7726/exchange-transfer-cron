import { OkPacket } from "mysql2";
import SQL from "sql-template-strings";
import Model from "./classes/Model";
import axios from "axios";
import ConnectionPool from "libs-connection-pool";

export default class AccountModel extends Model {
  
  async getAccountIdByOKXUid(uid: string): Promise<Account | undefined> {
    try {
      const sql = SQL`
        SELECT 
          id,
          user_id as userId,
          okx_uid as OKXUid
        FROM
          account_account
        WHERE
          okx_uid = ${uid}
        `;
        
        return await this.connection.readerQuerySingle<Account>(sql);
    } catch (e) {
      console.log(e)
    }

    return undefined
  }

  async getAccountId(id: number): Promise<Account | undefined> {
    try {
      const sql = SQL`
        SELECT
          id,
          user_id,
          okx_uid as OKXUid,
          wallet_key as walletKey,
          wallet_secret as walletSecret,
          tag,
          is_deposit as isDeposit
        FROM
          account_account
        WHERE
          id = ${id} and level > 0
      `

      return await this.connection.readerQuerySingle<Account>(sql);
    } catch (e) {
      console.log(e)
    }
  }

  async setAccountIsDeposit(id: number): Promise<void> {
    try {
      const sql = SQL`
      UPDATE account_account SET is_deposit = 1 WHERE id = ${id};
      `;

      await this.connection.writerQuery(sql)
    } catch (e) {
      console.log(e)
    }
  }

  async getPermission(id: number, permission: string): Promise<any> {
    try {
      const sql = SQL`
      SELECT 
        account_id,
        user_id,
        type
      FROM
        account_permission
      WHERE
        account_id = ${id} and type = ${permission}
      `;

      return await this.connection.readerQuerySingle(sql);
    } catch (e) {
      console.log(e)
    }
  }
}