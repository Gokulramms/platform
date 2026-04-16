npm run dev
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, Wifi, Tv, Shield, Users, BarChart3, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const features = [
  { icon: Users, text: "Manage 200+ customers per section" },
  { icon: BarChart3, text: "Real-time payment tracking" },
  { icon: CheckCircle, text: "Month-wise payment history" },
  { icon: Wifi, text: "Internet & Cable TV management" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@ashacable.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        toast.error("Invalid credentials. Please try again.");
      } else {
        toast.success("Welcome back!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12"
        style={{
          background: "linear-gradient(135deg, #0c0f24 0%, #141834 40%, #1e2250 100%)",
        }}
      >
        {/* Ambient glows */}
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-brand-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-purple-600/15 blur-[100px] pointer-events-none" />

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "linear-gradient(rgba(79,93,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(79,93,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        {/* Top — Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-12">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
                <Wifi className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-md">
                <Tv className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white leading-tight tracking-wide">
                ASHA CABLE
              </h1>
              <p className="text-brand-400 text-sm font-semibold">& ANITHA FIBERNET</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-4xl font-black text-white leading-snug mb-3">
              Your Subscription<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">
                Management Hub
              </span>
            </h2>
            <p className="text-dark-300 text-base leading-relaxed max-w-sm">
              Manage cable TV and internet customers, track monthly payments,
              and keep your business running smoothly — all in one place.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {features.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-600/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-brand-400" />
                </div>
                <span className="text-dark-300 text-sm">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom — Stats strip */}
        <div className="relative z-10 flex items-center gap-6">
          {[
            { label: "Connection Types", value: "2" },
            { label: "Max Boxes", value: "200+" },
            { label: "Payment History", value: "∞" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-xs text-dark-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-dark-950 relative">
        {/* Mobile glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full bg-brand-600/10 blur-[80px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm relative z-10"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-white leading-tight">ASHA CABLE & ANITHA FIBERNET</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-600/15 border border-brand-600/25 mb-4">
              <Shield className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-xs text-brand-300 font-medium">Admin Portal</span>
            </div>
            <h2 className="text-3xl font-black text-white mb-1.5">Sign In</h2>
            <p className="text-dark-400 text-sm">Enter your credentials to access the dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-brand-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@ashacable.com"
                  className="w-full bg-dark-800 border border-dark-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-4 py-3.5 pl-[52px] text-white text-sm placeholder-dark-500 outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-brand-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full bg-dark-800 border border-dark-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-4 py-3.5 pl-[52px] pr-12 text-white text-sm placeholder-dark-500 outline-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white transition-all duration-200 shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-dark-800">
            <p className="text-xs text-dark-500 text-center">
              Default: <span className="text-dark-400">admin@ashacable.com</span> ·{" "}
              <span className="text-dark-400">Admin@1234</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
