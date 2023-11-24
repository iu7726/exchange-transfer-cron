interface LogDeposit {
  accountId: number;
  address: string;
  okxUid: string;
  asset: string;
  network: string;
  amount: string;
  amountEq: string;
  depId: string;
  txId: string;
  state: string;
  raw: string;
}

interface LogDepositAlert {
  id: string;
  depId: string;
  accountId: number;
  okxUid: string;
  alertLevel: string; // "Severe",
  category: string; //"sanctions",
  service: string; // "OFAC SDN Blender.io 2022-05-06",
  amount: number; // 8868.24,
  categoryId: number; // 3
  raw: string
}