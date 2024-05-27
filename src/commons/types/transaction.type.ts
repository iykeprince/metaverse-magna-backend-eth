export type Transaction = {
  SenderAddress: string;
  ReceiverAddress: string | null;
  BlockNumber: number;
  BlockHash: string | null;
  TransactionHash: string;
  GasPriceInWEI: number;
  ValueInWEI: number;
};
