import { History } from "lucide-react";

export function RecentTransactions() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Recent transactions
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Your latest wallet activity
          </p>
        </div>

        <button
          disabled
          className="cursor-not-allowed text-xs font-semibold text-slate-400"
        >
          View all
        </button>
      </div>

      <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
          <History size={25} />
        </div>

        <h3 className="mt-4 text-sm font-semibold text-slate-800">
          No transactions yet
        </h3>

        <p className="mt-2 max-w-xs text-xs leading-6 text-slate-400">
          When you add money or make a transfer, your transaction history will
          appear here.
        </p>
      </div>
    </section>
  );
}
