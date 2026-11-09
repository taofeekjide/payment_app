export type Wallet = {
  id: string;
  userId: string;
  balanceKobo: string;
  currency: "NGN";
  status: "active" | "frozen" | "closed";
  createdAt: string;
};
