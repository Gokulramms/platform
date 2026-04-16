"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, User, Phone, MapPin, IndianRupee, Edit2,
  CheckCircle, XCircle, Clock, CheckCheck, Hash, Calendar,
  Download, AlertCircle, CheckSquare, Square, MinusSquare,
} from "lucide-react";
import { getMonthName, getCurrentMonthYear, MONTHS_SHORT } from "@/utils/months";
import { cn } from "@/utils/cn";
import toast from "react-hot-toast";

interface Payment {
  id: string;
  month: number;
  year: number;
  status: "PAID" | "PARTIAL" | "UNPAID";
  amountPaid: number;
  balance: number;
  paymentDate: string | null;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  connectionType: "INTERNET" | "CABLE";
  boxNumber: number;
  hardwareId: string | null;
  planAmount: number;
  payments: Payment[];
}

interface props {
  customer: Customer;
  onClose: () => void;
  onEdit: () => void;
  onPaymentUpdate: () => void;
}

// ── Pay Dialog ───────────────────────────────────────────────
function PayDialog({
  selectedCount,
  onConfirm,
  onCancel,
}: {
  selectedCount: number;
  onConfirm: (amount: number, balance: number) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState("0");

  const parsedAmt = parseFloat(amount) || 0;
  const parsedBal = parseFloat(balance) || 0;
  
  const isPaid = parsedBal === 0 && parsedAmt > 0;
  const isPartial = parsedBal > 0 && parsedAmt > 0;
  const isUnpaid = parsedBal > 0 && parsedAmt === 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-dark-900 border border-dark-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      >
        <h3 className="text-base font-bold text-white mb-1">Record Payment</h3>
        <p className="text-xs text-dark-400 mb-5">
          Marking <span className="text-white font-semibold">{selectedCount}</span> month{selectedCount !== 1 ? "s" : ""}
        </p>

        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">
              Amount Paid (₹)
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                autoFocus
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-dark-800 border border-dark-700 focus:border-brand-500 rounded-xl px-4 py-2.5 pl-9 text-white text-sm outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">
              Balance Due (₹)
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="number"
                min={0}
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full bg-dark-800 border border-dark-700 focus:border-brand-500 rounded-xl px-4 py-2.5 pl-9 text-white text-sm outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className={cn(
          "text-xs px-3 py-2 rounded-lg mb-5 flex items-center gap-2",
          isPartial ? "bg-amber-900/30 text-amber-300 border border-amber-800/40" :
          isPaid ? "bg-green-900/30 text-green-300 border border-green-800/40" :
          isUnpaid ? "bg-red-900/30 text-red-300 border border-red-800/40" :
          "bg-dark-800 text-dark-400"
        )}>
          {isPartial && <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
          {isPaid && <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />}
          {isUnpaid && <XCircle className="w-3.5 h-3.5 flex-shrink-0" />}
          {isPartial && "Partial payment"}
          {isPaid && "Fully paid"}
          {isUnpaid && "Unpaid (Carried forward)"}
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-dark-200 text-sm font-medium hover:bg-dark-700 transition-all">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(parsedAmt, parsedBal)}
            className="flex-1 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-bold transition-all"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────
export function PaymentPanel({ customer, onClose, onEdit, onPaymentUpdate }: props) {
  const queryClient = useQueryClient();
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<"PAID" | "UNPAID" | null>(null);

  const { data: fullCustomer, isLoading } = useQuery<Customer>({
    queryKey: ["customer", customer.id],
    queryFn: () => fetch(`/api/customers/${customer.id}`).then((r) => r.json()),
  });

  const data = fullCustomer ?? customer;
  const payments = data.payments ?? [];

  const years = Array.from(new Set(payments.map((p) => p.year))).sort((a, b) => b - a);
  const filteredPayments = payments
    .filter((p) => p.year === selectedYear)
    .sort((a, b) => a.month - b.month);

  // Selection helpers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = () => setSelectedIds(new Set(filteredPayments.map((p) => p.id)));
  const selectUnpaid = () => setSelectedIds(new Set(filteredPayments.filter((p) => p.status === "UNPAID" || p.status === "PARTIAL").map((p) => p.id)));
  const selectPaid = () => setSelectedIds(new Set(filteredPayments.filter((p) => p.status === "PAID").map((p) => p.id)));
  const clearSelection = () => setSelectedIds(new Set());

  // Mutations
  const bulkMutation = useMutation({
    mutationFn: async ({ paymentIds, status, amountPaid, balance }: { paymentIds: string[]; status: string; amountPaid?: number; balance?: number }) => {
      const res = await fetch("/api/payments/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIds, status, amountPaid, balance }),
      });
      if (!res.ok) throw new Error("Failed to update payments");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["customer", customer.id] });
      onPaymentUpdate();
      clearSelection();
      toast.success(`Updated ${data.updated} payment${data.updated !== 1 ? "s" : ""}!`);
    },
    onError: () => toast.error("Failed to update payments"),
  });

  const handleMarkPaid = () => {
    if (selectedIds.size === 0) return;
    setPendingAction("PAID");
    setShowPayDialog(true);
  };

  const handleMarkUnpaid = () => {
    if (selectedIds.size === 0) return;
    bulkMutation.mutate({ paymentIds: Array.from(selectedIds), status: "UNPAID" });
  };

  const handlePayConfirm = (amount: number, balance: number) => {
    setShowPayDialog(false);
    bulkMutation.mutate({
      paymentIds: Array.from(selectedIds),
      status: "PAID",
      amountPaid: amount,
      balance: balance,
    });
  };

  // Stats
  const paid = filteredPayments.filter((p) => p.status === "PAID").length;
  const partial = filteredPayments.filter((p) => p.status === "PARTIAL").length;
  const unpaid = filteredPayments.filter((p) => p.status === "UNPAID").length;
  const totalBalance = filteredPayments.reduce((acc, p) => acc + (p.balance || 0), 0);

  const allSelected = filteredPayments.length > 0 && selectedIds.size === filteredPayments.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  return (
    <>
      {showPayDialog && (
        <PayDialog
          selectedCount={selectedIds.size}
          onConfirm={handlePayConfirm}
          onCancel={() => setShowPayDialog(false)}
        />
      )}

      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ duration: 0.25 }}
          className="bg-dark-900 border border-dark-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
        >
          {/* ── Header ── */}
          <div className="px-5 py-4 border-b border-dark-800 flex-shrink-0">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-brand-600/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">{data.name}</h2>
                  <p className="text-dark-500 text-xs">
                    Box #{data.boxNumber}
                    {data.hardwareId && ` (${data.hardwareId})`}
                    {" "}· {data.connectionType}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/api/download?customerId=${data.id}`}
                  download
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 border border-dark-700 text-dark-300 hover:text-white text-xs font-medium transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </a>
                <button onClick={onEdit} className="w-8 h-8 rounded-lg bg-dark-800 hover:bg-dark-700 flex items-center justify-center transition-colors">
                  <Edit2 className="w-4 h-4 text-dark-400" />
                </button>
                <button onClick={onClose} className="w-8 h-8 rounded-lg bg-dark-800 hover:bg-dark-700 flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-dark-400" />
                </button>
              </div>
            </div>

            {/* Customer Info Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { icon: <Phone className="w-3 h-3" />, val: data.phone },
                { icon: <MapPin className="w-3 h-3" />, val: data.address },
                { icon: <Hash className="w-3 h-3" />, val: `Box #${data.boxNumber}` },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-dark-800 rounded-lg px-3 py-2">
                  <span className="text-dark-500 flex-shrink-0">{item.icon}</span>
                  <span className="text-white text-xs truncate">{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-5 py-4">
              {/* Year selector + stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-400" />
                  <span className="font-semibold text-white text-sm">Payment History</span>
                </div>
                <div className="flex gap-1.5">
                  {years.map((y) => (
                    <button
                      key={y}
                      onClick={() => { setSelectedYear(y); clearSelection(); }}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                        selectedYear === y
                          ? "bg-brand-600/30 text-brand-300 border border-brand-600/40"
                          : "bg-dark-800 text-dark-400 border border-dark-700 hover:border-dark-500"
                      )}
                    >{y}</button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { val: paid, label: "Paid", bg: "bg-green-950/60 border-green-900/60", text: "text-green-400" },
                  { val: partial, label: "Partial", bg: "bg-amber-950/60 border-amber-900/60", text: "text-amber-400" },
                  { val: unpaid, label: "Unpaid", bg: "bg-red-950/60 border-red-900/60", text: "text-red-400" },
                  { val: `₹${totalBalance.toFixed(0)}`, label: "Balance", bg: "bg-dark-800 border-dark-700", text: "text-white" },
                ].map((s) => (
                  <div key={s.label} className={cn("border rounded-xl p-2.5 text-center", s.bg)}>
                    <p className={cn("text-lg font-black", s.text)}>{s.val}</p>
                    <p className="text-[10px] text-dark-500">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Selection controls */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <button
                  onClick={allSelected ? clearSelection : selectAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700 hover:border-dark-500 text-dark-300 hover:text-white text-xs font-medium transition-all"
                >
                  {allSelected ? <CheckSquare className="w-3.5 h-3.5" /> : someSelected ? <MinusSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  All
                </button>
                <button onClick={selectUnpaid} className="px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700 hover:border-red-700 text-dark-300 hover:text-red-300 text-xs font-medium transition-all">
                  Select Unpaid
                </button>
                <button onClick={selectPaid} className="px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700 hover:border-green-700 text-dark-300 hover:text-green-300 text-xs font-medium transition-all">
                  Select Paid
                </button>
                {selectedIds.size > 0 && (
                  <button onClick={clearSelection} className="px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700 text-dark-400 text-xs transition-all hover:text-white">
                    Clear ({selectedIds.size})
                  </button>
                )}
              </div>

              {/* Batch action bar */}
              <AnimatePresence>
                {selectedIds.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex gap-2 mb-4 p-3 rounded-xl bg-dark-800 border border-dark-700"
                  >
                    <span className="text-xs text-dark-400 mr-1 self-center">
                      {selectedIds.size} selected:
                    </span>
                    <button
                      onClick={handleMarkPaid}
                      disabled={bulkMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-green-700/30 hover:bg-green-700/50 border border-green-700/40 text-green-300 text-xs font-bold transition-all disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Mark Paid
                    </button>
                    <button
                      onClick={handleMarkUnpaid}
                      disabled={bulkMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-700/30 hover:bg-red-700/50 border border-red-700/40 text-red-300 text-xs font-bold transition-all disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Mark Unpaid
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Month Grid */}
              {isLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="h-20 rounded-xl bg-dark-800 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {filteredPayments.map((payment: any) => {
                    const isPaid = payment.status === "PAID";
                    const isPartial = payment.status === "PARTIAL";
                    const isUnpaid = payment.status === "UNPAID";
                    const isCurrentMonth = payment.month === currentMonth && payment.year === currentYear;
                    const isSelected = selectedIds.has(payment.id);
                    const balance = payment.balance || 0;

                    return (
                      <motion.button
                        key={payment.id}
                        id={`payment-${payment.month}-${payment.year}`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => toggleSelect(payment.id)}
                        className={cn(
                          "rounded-xl p-2.5 text-left border transition-all duration-150 relative cursor-pointer",
                          isPaid && !isSelected && "bg-green-950/60 border-green-900/50 hover:border-green-600",
                          isPartial && !isSelected && "bg-amber-950/60 border-amber-900/50 hover:border-amber-500",
                          isUnpaid && !isSelected && "bg-red-950/50 border-red-900/40 hover:border-red-600",
                          isSelected && "ring-2 ring-brand-500 ring-offset-1 ring-offset-dark-900 border-brand-500/50 bg-brand-950/30",
                          isCurrentMonth && !isSelected && "ring-1 ring-brand-600/60"
                        )}
                      >
                        {/* Selected checkbox */}
                        <div className={cn(
                          "absolute top-2 right-2 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all",
                          isSelected ? "bg-brand-500" : "bg-dark-700 border border-dark-600"
                        )}>
                          {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>

                        {/* Status icon */}
                        <div className="mb-1.5">
                          {isPaid && <CheckCircle className="w-3.5 h-3.5 text-green-400" />}
                          {isPartial && <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
                          {isUnpaid && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                        </div>

                        {/* Month name */}
                        <p className="text-xs font-bold text-white leading-tight">
                          {MONTHS_SHORT[payment.month - 1]}
                          {isCurrentMonth && <span className="ml-1 text-[9px] text-brand-400">●</span>}
                        </p>

                        {/* Status label */}
                        <p className={cn(
                          "text-[9px] font-semibold mt-0.5",
                          isPaid ? "text-green-400" : isPartial ? "text-amber-400" : "text-red-400"
                        )}>
                          {isPaid ? "PAID" : isPartial ? "PARTIAL" : "UNPAID"}
                        </p>

                        {/* Amount info */}
                        {isPaid && (
                          <p className="text-[9px] text-green-600 mt-0.5">₹{payment.amountPaid}</p>
                        )}
                        {isPartial && (
                          <div>
                            <p className="text-[9px] text-amber-400">₹{payment.amountPaid} paid</p>
                            <p className="text-[9px] text-red-400">₹{balance} due</p>
                          </div>
                        )}
                        {isUnpaid && payment.balance > 0 && (
                          <p className="text-[9px] text-red-500">₹{payment.balance} due</p>
                        )}

                        {/* Date */}
                        {isPaid && payment.paymentDate && (
                          <p className="text-[8px] text-green-700 mt-0.5">
                            {new Date(payment.paymentDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                          </p>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {filteredPayments.length === 0 && !isLoading && (
                <p className="text-center text-dark-400 text-sm py-10">No records for {selectedYear}</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
