import * as crypto from "crypto"
// import Dotenv from "dotenv";

// Dotenv.config();

const getLocalTime = () => {
  return Math.floor(new Date().getTime() / 1000)
}

export class OKX {
  secret: string
  apiKey: string
  passphrase: string

  constructor() {
    this.secret = process.env.OKEX_BROKER_SECRET_KEY ?? ''
    this.apiKey = process.env.OKEX_BROKER_KEY ?? ''
    this.passphrase = process.env.OKEX_BROKER_PASSPHRASE ?? ''
  }

  public login(): string {
    const timestamp = getLocalTime()
    const message = timestamp + 'GET' + '/users/self/verify'

    const sign = crypto.createHmac('SHA256', Buffer.from(this.secret))
        .update(Buffer.from(message))
        .digest('base64')
    
    const loginParams = {
      "op": "login", 
      "args": [
        {
          "apiKey": this.apiKey,
          "passphrase": this.passphrase,
          "timestamp": timestamp,
          "sign": sign
        }
      ]
    }

    return JSON.stringify(loginParams)
  }
}