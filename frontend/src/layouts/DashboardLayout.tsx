import { useState } from "react";
import {
  Bell,
  ChevronDown,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Wallet,
  X,
  ArrowLeftRight,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const navigation = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { label: "My wallet", path: "/dashboard", icon: Wallet },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-[76px] items-center justify-between border-b border-slate-800 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-[#102033]">
            <Wallet size={21} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            PayFlow
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(false)}
          className="text-slate-400 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <X size={21} />
        </button>
      </div>

      <div className="px-4 py-7">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
          Workspace
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon size={19} />
                {item.label}
              </NavLink>
            );
          })}

          <div className="flex items-center justify-between rounded-xl px-3 py-3 text-sm text-slate-500">
            <span className="flex items-center gap-3">
              <ArrowLeftRight size={19} />
              Transactions
            </span>
            <span className="rounded-md bg-slate-800 px-2 py-1 text-[9px] font-semibold uppercase">
              Soon
            </span>
          </div>
        </nav>
      </div>

      <div className="mt-auto space-y-1 border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400">
          <Settings size={18} />
          Settings
          <span className="ml-auto text-[9px] text-slate-500">SOON</span>
        </div>

        <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400">
          <CircleHelp size={18} />
          Help and support
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] bg-[#102033] lg:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu overlay"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-slate-950/50"
          />
          <aside className="absolute inset-y-0 left-0 w-[280px] bg-[#102033] shadow-2xl">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-[260px]">
        {/* Top navigation */}
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="text-sm font-semibold text-slate-800">Dashboard</p>
              <p className="hidden text-xs text-slate-400 sm:block">
                Manage your PayFlow account
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button
              aria-label="Notifications"
              className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
            >
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-emerald-500" />
            </button>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
                {user?.fullName?.charAt(0).toUpperCase() || "U"}
              </div>

              <div className="hidden sm:block">
                <p className="max-w-[150px] truncate text-sm font-semibold text-slate-800">
                  {user?.fullName || "PayFlow User"}
                </p>
                <p className="text-xs capitalize text-slate-400">
                  {user?.role || "Customer"}
                </p>
              </div>

              <ChevronDown
                size={16}
                className="hidden text-slate-400 sm:block"
              />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
