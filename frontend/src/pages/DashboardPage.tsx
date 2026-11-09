import { Clock3, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { WalletBalanceCard } from "../components/dashboard/WalletBalanceCard";
import { QuickActions } from "../components/dashboard/QuickActions";
import { RecentTransactions } from "../components/dashboard/RecentTransactions";

export function DashboardPage() {
  const { user } = useAuth();

  const firstName = user?.fullName?.trim().split(" ")[0] || "there";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome section */}
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-400">
              Your financial overview
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back, {firstName}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Here's what's happening with your wallet.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
            <ShieldCheck size={15} />
            Account active
          </div>
        </section>

        {/* Balance and account summary */}
        <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
          <WalletBalanceCard />

          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800">
                  Account overview
                </h2>
                <Clock3 size={18} className="text-slate-400" />
              </div>

              <p className="mt-6 text-xs text-slate-400">ACCOUNT HOLDER</p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {user?.fullName || "PayFlow User"}
              </p>

              <p className="mt-5 text-xs text-slate-400">EMAIL ADDRESS</p>
              <p className="mt-1 break-all text-sm font-medium text-slate-700">
                {user?.email}
              </p>
            </div>

            <div className="mt-7 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Account type</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">
                  {user?.role || "Customer"}
                </span>
              </div>
            </div>
          </div>
        </section>

        <QuickActions />

        <RecentTransactions />
      </div>
    </DashboardLayout>
  );
}
