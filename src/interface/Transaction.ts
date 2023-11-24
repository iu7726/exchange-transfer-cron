enum TransactionState {
  PENDING='pending',
  ATTENTION='attention',
  CHECK='check',
  REJECT='reject',
  APPROVED='approved',
  COMPLETE='complete',
  FAIL='fail'
}

interface TransactionAttentionDTO {
  accountId: number;
  userId: number;
  type: string;
  depId: string | null;
  wdId: string | null;
  wdRequestId: string | null;
  alertLevel: string;
  state: string;
}