import { useEffect, useState } from "react";
import { Eye, EyeOff, Plus, ArrowUpRight, Wallet } from "lucide-react";

import { walletService } from "../../services/walletService";
import type { Wallet as WalletType } from "../../types/wallet";

function formatKobo(balanceKobo: string) {
  const amount = BigInt(balanceKobo);
  const naira = amount / 100n;
  const kobo = (amount % 100n).toString().padStart(2, "0");

  const formattedNaira = new Intl.NumberFormat("en-NG").format(naira);

  return `₦${formattedNaira}.${kobo}`;
}

export function WalletBalanceCard() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWallet() {
      try {
        const data = await walletService.getWallet();
        setWallet(data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Unable to load wallet.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadWallet();
  }, []);

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#102D3F] via-[#123C45] to-[#087B66] p-6 text-white shadow-xl shadow-emerald-950/10 sm:p-8">
      <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[35px] border-white/[0.04]" />
      <div className="absolute -bottom-32 right-24 h-64 w-64 rounded-full border-[35px] border-white/[0.04]" />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-emerald-100/80">
            <Wallet size={17} />
            Total wallet balance
          </div>

          <div className="mt-5 flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {isLoading
                ? "Loading..."
                : error
                  ? "Unavailable"
                  : balanceVisible
                    ? formatKobo(wallet?.balanceKobo ?? "0")
                    : "₦ ••••••"}
            </h2>

            <button
              onClick={() => setBalanceVisible((visible) => !visible)}
              aria-label={balanceVisible ? "Hide balance" : "Show balance"}
              className="rounded-lg p-2 text-emerald-100/70 transition hover:bg-white/10 hover:text-white"
            >
              {balanceVisible ? <Eye size={19} /> : <EyeOff size={19} />}
            </button>
          </div>

          <p className="mt-3 text-xs text-emerald-100/60">
            {error || "Your available wallet balance"}
          </p>
        </div>

        <div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 sm:flex">
          <Wallet size={23} />
        </div>
      </div>

      <div className="relative z-10 mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-emerald-100/60">
            Account currency
          </p>
          <p className="mt-1 text-sm font-semibold">Nigerian Naira (NGN)</p>
        </div>

        <button
          disabled
          className="flex cursor-not-allowed items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#123C45] opacity-90"
        >
          <Plus size={17} />
          Add money
          <ArrowUpRight size={15} />
        </button>
      </div>
    </section>
  );
}
