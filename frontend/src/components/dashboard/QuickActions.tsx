import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  History,
} from "lucide-react";

const actions = [
  {
    title: "Add money",
    description: "Fund your wallet",
    icon: ArrowDownLeft,
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Send money",
    description: "Transfer to someone",
    icon: ArrowUpRight,
    color: "bg-blue-50 text-blue-700",
  },
  {
    title: "Transactions",
    description: "View your activity",
    icon: History,
    color: "bg-violet-50 text-violet-700",
  },
  {
    title: "Transfer",
    description: "Move your money",
    icon: ArrowLeftRight,
    color: "bg-amber-50 text-amber-700",
  },
];

export function QuickActions() {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900">Quick actions</h2>
        <p className="mt-1 text-sm text-slate-400">
          Common things you can do with your wallet
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <div
              key={action.title}
              className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${action.color}`}
              >
                <Icon size={21} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-800">
                {action.title}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {action.description}
              </p>

              <span className="mt-3 inline-block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Coming soon
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
