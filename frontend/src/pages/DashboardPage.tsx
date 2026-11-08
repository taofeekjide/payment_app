import { LogOut, Wallet } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#101D2D] text-emerald-400">
              <Wallet size={21} />
            </div>
            <span className="text-xl font-bold text-[#101D2D]">PayFlow</span>
          </div>

          <Button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white text-slate-600 shadow-none hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut size={17} />
            Log out
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-sm font-medium text-emerald-700">YOUR DASHBOARD</p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Welcome, {user?.fullName || "User"}
        </h1>

        <p className="mt-2 text-slate-500">Your PayFlow account is ready.</p>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8">
          <p className="text-sm text-slate-500">Account email</p>
          <p className="mt-2 font-semibold text-slate-900">{user?.email}</p>

          <p className="mt-6 text-sm text-slate-500">Account role</p>
          <p className="mt-2 font-semibold capitalize text-slate-900">
            {user?.role}
          </p>
        </div>
      </section>
    </main>
  );
}
