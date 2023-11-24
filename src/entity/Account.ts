interface Account {
  id: number;
  userId: number;
  OKXUid: string;
  walletKey?: string;
  walletSecret?: string;
  tag?: string;
  isDeposit?: boolean;
}