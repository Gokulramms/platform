"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users, Wifi, Tv, CheckCircle, XCircle,
  TrendingUp, Clock, Activity
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { getMonthName } from "@/utils/months";
import Link from "next/link";

interface DashboardStats {
  totalCustomers: number;
  totalInternet: number;
  totalCable: number;
  paidThisMonth: number;
  unpaidThisMonth: number;
  paidPercent: number;
  currentMonth: number;
  currentYear: number;
  recentPayments: Array<{
    id: string;
    paymentDate: string;
    customer: { name: string; connectionType: string; boxNumber: number };
  }>;
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard"],
    queryFn: () => fetch("/api/dashboard").then((r) => r.json()),
    refetchInterval: 30000,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="p-6 lg:p-8 min-h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-8 rounded-full bg-gradient-to-b from-brand-400 to-brand-600" />
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Dashboard Overview
          </h1>
        </div>
        <p className="text-slate-600 ml-5">
          {isLoading ? "Loading..." : `${getMonthName(stats?.currentMonth ?? new Date().getMonth() + 1)} ${stats?.currentYear ?? new Date().getFullYear()} — Real-time subscription stats`}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8"
      >
        <motion.div variants={itemVariants}>
          <StatCard
            title="Total Customers"
            value={stats?.totalCustomers ?? 0}
            icon={<Users className="w-5 h-5" />}
            color="brand"
            loading={isLoading}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Internet Customers"
            value={stats?.totalInternet ?? 0}
            icon={<Wifi className="w-5 h-5" />}
            color="blue"
            loading={isLoading}
            href="/dashboard/internet"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Cable Customers"
            value={stats?.totalCable ?? 0}
            icon={<Tv className="w-5 h-5" />}
            color="purple"
            loading={isLoading}
            href="/dashboard/cable"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Paid This Month"
            value={`${stats?.paidPercent ?? 0}%`}
            subtitle={`${stats?.paidThisMonth ?? 0} of ${(stats?.paidThisMonth ?? 0) + (stats?.unpaidThisMonth ?? 0)}`}
            icon={<TrendingUp className="w-5 h-5" />}
            color="green"
            loading={isLoading}
          />
        </motion.div>
      </motion.div>

      {/* Secondary Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
      >
        <motion.div variants={itemVariants}>
          <div className="glass rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Paid This Month</p>
              <p className="text-2xl font-bold text-green-600">
                {isLoading ? "—" : stats?.paidThisMonth ?? 0}
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants}>
          <div className="glass rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Pending Payments</p>
              <p className="text-2xl font-bold text-red-600">
                {isLoading ? "—" : stats?.unpaidThisMonth ?? 0}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Quick Actions + Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <Link
              href="/dashboard/internet"
              className="flex items-center gap-4 p-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 hover:border-brand-600 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-600/20 flex items-center justify-center group-hover:bg-brand-600/30 transition-colors">
                <Wifi className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Internet Customers</p>
                <p className="text-xs text-slate-600">{stats?.totalInternet ?? 0} active connections</p>
              </div>
            </Link>
            <Link
              href="/dashboard/cable"
              className="flex items-center gap-4 p-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 hover:border-purple-600 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                <Tv className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Cable Customers</p>
                <p className="text-xs text-slate-600">{stats?.totalCable ?? 0} active connections</p>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Recent Payments */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-semibold text-slate-900">Recent Payments</h2>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 bg-white rounded-lg animate-pulse" />
              ))}
            </div>
          ) : stats?.recentPayments?.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-6">No payments recorded yet</p>
          ) : (
            <div className="space-y-2">
              {stats?.recentPayments?.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{p.customer.name}</p>
                      <p className="text-xs text-slate-600">
                        Box {p.customer.boxNumber} · {p.customer.connectionType}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">
                    {new Date(p.paymentDate).toLocaleDateString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
