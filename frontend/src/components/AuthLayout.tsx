import type { ReactNode } from "react";
import { ArrowUpRight, ShieldCheck, Wallet } from "lucide-react";

type AuthLayoutProps = {
  children: ReactNode;
  title: string;
  description: string;
  footer: ReactNode;
};

export function AuthLayout({
  children,
  title,
  description,
  footer,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* Left branding panel */}
      <section className="relative hidden min-h-screen overflow-hidden bg-[#101D2D] px-12 py-10 text-white lg:flex lg:flex-col xl:px-20">
        <div className="absolute -left-40 top-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 text-[#101D2D]">
            <Wallet size={23} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold tracking-tight">PayFlow</span>
        </div>

        <div className="relative z-10 my-auto max-w-xl">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium tracking-wide text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />A simpler
            way to manage your money
          </span>

          <h1 className="max-w-lg text-5xl font-semibold leading-[1.15] tracking-tight xl:text-6xl">
            Your money.
            <br />
            Your control.
            <br />
            <span className="text-emerald-400">Your future.</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-8 text-slate-400">
            Manage your wallet, keep track of transactions, and move money with
            a payment experience designed around simplicity.
          </p>

          {/* Decorative wallet card */}
          <div className="relative mt-14 max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-[#24384B] to-[#182738] p-6 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Wallet size={17} />
                PayFlow Wallet
              </div>
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                Active
              </span>
            </div>

            <p className="mt-8 text-xs text-slate-400">Available balance</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              ₦250,000<span className="text-slate-400">.00</span>
            </p>

            <div className="mt-8 flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-500">WALLET HOLDER</p>
                <p className="mt-1 text-sm font-medium">Your Name</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400 text-[#101D2D]">
                <ArrowUpRight size={19} />
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 text-sm text-slate-400">
            <ShieldCheck size={18} className="text-emerald-400" />
            Built with security and simplicity in mind
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500">
          <span>© 2026 PayFlow</span>
          <span>Payments made simpler.</span>
        </div>
      </section>

      {/* Right form panel */}
      <section className="flex min-h-screen flex-col px-5 py-8 sm:px-10 lg:px-12 xl:px-20">
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#101D2D] text-emerald-400">
            <Wallet size={21} />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#101D2D]">
            PayFlow
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[440px]">
            <div className="mb-9">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-emerald-600">
                Welcome to PayFlow
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {title}
              </h2>
              <p className="mt-3 text-[15px] leading-7 text-slate-500">
                {description}
              </p>
            </div>

            {children}

            <div className="mt-8 border-t border-slate-100 pt-6">{footer}</div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          © 2026 PayFlow. All rights reserved.
        </div>
      </section>
    </main>
  );
}
