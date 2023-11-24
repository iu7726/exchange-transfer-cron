import AWS from 'aws-sdk'
import dotenv from "dotenv";

dotenv.config()

export default class KMSModel {
  aws: AWS.KMS

  constructor() {
    this.initKMS()
    this.aws = new AWS.KMS()
  }

  async initKMS(): Promise<void> {
    AWS.config.update({
      accessKeyId: String(process.env.AWS_ACCESS_KEY_ID),
      secretAccessKey: String(process.env.AWS_SECRET_ACCESS_KEY),
      region: 'ap-southeast-1'
    })
  }

  async encrypt(plaintext: string): Promise<string | undefined> {
    const response = await this.aws.encrypt({
      KeyId: String(process.env.AWS_KMS_KEY_ID),
      Plaintext: Buffer.from(plaintext)
    }).promise()

    const result = response.CiphertextBlob?.toString('base64')
    
    return result
  }
    
  async decrypt(key: string): Promise<string | undefined> {
    const response = await this.aws.decrypt({
      CiphertextBlob: Buffer.from(key, 'base64')
    }).promise()

    return response.Plaintext?.toString('utf-8')
  }
}