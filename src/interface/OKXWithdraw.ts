interface OKXWithdraw {
  ccy: string
  amt: string
  dest: string
  toAddr: string
  fee: string
  chain: string,
  clientId: string
}

interface OKXTransfer {
  ccy: string
  amt: string
  to: string
  from_:string
}