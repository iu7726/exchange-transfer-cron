interface OKXDepositArg {
  channel: string, // deposit-info
  uid: string// 488582982874087368
}

interface OKXDepositData {
  actualDepBlkConfirm: string, // "1",
  amt: string, // "22.090361",
  areaCodeFrom: string, //"",
  ccy: string, //"XRP",
  chain: string, //"XRP-Ripple",
  depId: string, // "142527916",
  from: string, //"",
  fromWdId: string, // "",
  pTime: string, //"1697184591513",
  state: string, //"2",
  subAcct: string, //"OgUser4679",
  to: string, //"rUzWJkXyEtT8ekSSxkBYPqCvHpngcy6Fks:6114223",
  ts: string, //"1697184588000",
  txId: string, //"6AE48EAC28F97CC1BB2B784625725F7D3B0AA54B999B589E50EC3211E8CF315B",
  uid: string, //"492299276257468948"
}

interface OKXDeposit {
  arg: OKXDepositArg,
  data: OKXDepositData[]
}