import { apiRequest } from "./api";
import type { Wallet } from "../types/wallet";

export const walletService = {
  async getWallet(): Promise<Wallet> {
    const response = await apiRequest<{ wallet: Wallet }>("/wallet");
    return response.wallet;
  },
};
