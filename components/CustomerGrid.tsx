"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, Tv, Search, Filter, RefreshCw, PlusSquare, Download, X, Settings } from "lucide-react";
import { CustomerBox } from "@/components/CustomerBox";
import { SearchBar } from "@/components/SearchBar";
import { CustomerModal } from "@/components/CustomerModal";
import { PaymentPanel } from "@/components/PaymentPanel";
import toast from "react-hot-toast";

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  connectionType: "INTERNET" | "CABLE";
  boxNumber: number;
  hardwareId: string | null;
  planAmount: number;
  payments: Array<{
    id: string;
    status: "PAID" | "PARTIAL" | "UNPAID";
    month: number;
    year: number;
    paymentDate: string | null;
    amountPaid: number;
    balance: number;
  }>;
}

interface CustomerGridProps {
  connectionType: "INTERNET" | "CABLE";
}

type FilterType = "all" | "paid" | "unpaid";

const STORAGE_KEY_PREFIX = "asha_total_boxes_";
const DEFAULT_BOXES = 200;

export function CustomerGrid({ connectionType }: CustomerGridProps) {
  const queryClient = useQueryClient();
  const storageKey = STORAGE_KEY_PREFIX + connectionType.toLowerCase();

  // Dynamic box count, persisted in localStorage
  const [totalBoxes, setTotalBoxes] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      return stored ? parseInt(stored) : DEFAULT_BOXES;
    }
    return DEFAULT_BOXES;
  });
  const [showBoxInput, setShowBoxInput] = useState(false);
  const [newBoxCount, setNewBoxCount] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  const [addingToBox, setAddingToBox] = useState<number | null>(null);

  const { data: customers = [], isLoading, refetch } = useQuery<Customer[]>({
    queryKey: ["customers", connectionType, search, filter],
    queryFn: () => {
      const params = new URLSearchParams({ type: connectionType });
      if (search) params.set("search", search);
      if (filter !== "all") params.set("filter", filter);
      return fetch(`/api/customers?${params}`).then((r) => r.json());
    },
  });

  const customerMap = new Map<number, Customer>();
  customers.forEach((c) => customerMap.set(c.boxNumber, c));

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const isCustomerPaidThisMonth = (c: Customer) =>
    c.payments.find((p) => p.month === currentMonth && p.year === currentYear)?.status === "PAID";

  const handleBoxClick = (boxNumber: number) => {
    const customer = customerMap.get(boxNumber);
    if (customer) {
      setSelectedCustomer(customer);
      setShowPayments(true);
    } else {
      setAddingToBox(boxNumber);
      setSelectedCustomer(null);
      setShowModal(true);
    }
  };

  const handleAddBoxes = () => {
    const val = parseInt(newBoxCount);
    if (!val || val < totalBoxes) {
      toast.error(`Enter a number greater than ${totalBoxes}`);
      return;
    }
    setTotalBoxes(val);
    localStorage.setItem(storageKey, val.toString());
    setShowBoxInput(false);
    setNewBoxCount("");
    toast.success(`Grid expanded to ${val} boxes!`);
  };

  const isSearching = search.trim() !== "" || filter !== "all";
  const icon = connectionType === "INTERNET" ? <Wifi className="w-5 h-5" /> : <Tv className="w-5 h-5" />;
  const colorClass = connectionType === "INTERNET" ? "text-brand-400" : "text-purple-400";

  return (
    <div className="p-4 lg:p-6 min-h-full">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className="w-2 h-8 mt-1 rounded-full bg-gradient-to-b from-brand-400 to-brand-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2 flex-wrap">
            <span className={colorClass}>{icon}</span>
            {connectionType === "INTERNET" ? "Internet" : "Cable TV"} Customers
          </h1>
          <p className="text-dark-400 text-sm mt-0.5">
            {isLoading ? "Loading..." : `${customers.length} customers · ${totalBoxes} boxes total`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Download CSV */}
          <a
            href={`/api/download?type=${connectionType}&month=current`}
            download
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 border border-dark-700 hover:border-dark-500 text-dark-300 hover:text-white text-xs font-medium transition-all"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </a>

          {/* Add Boxes */}
          <button
            id="add-boxes-btn"
            onClick={() => { setShowBoxInput(!showBoxInput); setNewBoxCount((totalBoxes + 50).toString()); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-700/30 hover:bg-brand-700/50 border border-brand-700/40 text-brand-300 text-xs font-medium transition-all"
          >
            <PlusSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Add Boxes</span>
          </button>
        </div>
      </div>

      {/* Add Boxes Panel */}
      <AnimatePresence>
        {showBoxInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-dark-800 border border-brand-700/30 rounded-xl p-4 flex items-center gap-3">
              <Settings className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white mb-0.5">Expand Grid</p>
                <p className="text-xs text-dark-400">Current: {totalBoxes} boxes. Set new total (must be higher):</p>
              </div>
              <input
                type="number"
                value={newBoxCount}
                onChange={(e) => setNewBoxCount(e.target.value)}
                min={totalBoxes + 1}
                placeholder={`> ${totalBoxes}`}
                className="w-28 bg-dark-700 border border-dark-600 focus:border-brand-500 rounded-lg px-3 py-2 text-white text-sm outline-none transition-all"
              />
              <button onClick={handleAddBoxes} className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold transition-all">
                Apply
              </button>
              <button onClick={() => setShowBoxInput(false)} className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} />
        <div className="flex gap-2 flex-shrink-0">
          {(["all", "paid", "unpaid"] as FilterType[]).map((f) => (
            <button
              key={f}
              id={`filter-${f}`}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${
                filter === f
                  ? f === "paid" ? "bg-green-700/30 text-green-300 border border-green-700/50"
                  : f === "unpaid" ? "bg-red-700/30 text-red-300 border border-red-700/50"
                  : "bg-brand-700/30 text-brand-300 border border-brand-700/50"
                  : "bg-dark-800 text-dark-400 border border-dark-700 hover:border-dark-500"
              }`}
            >
              {f === "all" && <Filter className="w-3.5 h-3.5 inline mr-1" />}
              {f}
            </button>
          ))}
          <button
            id="refresh-btn"
            onClick={() => refetch()}
            title="Refresh"
            className="px-3 py-2 rounded-lg bg-dark-800 text-dark-300 border border-dark-700 hover:border-dark-500 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-dark-400">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-900 border border-green-700" /> Paid</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-950 border border-amber-700" /> Partial</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-950 border border-red-800" /> Unpaid</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-dark-800 border border-dashed border-dark-600" /> Empty</span>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15 2xl:grid-cols-20 gap-2">
          {[...Array(40)].map((_, i) => (
            <div key={i} className="h-20 bg-dark-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15 2xl:grid-cols-20 gap-2"
        >
          {isSearching ? (
            customers.map((c) => (
              <CustomerBox
                key={c.boxNumber}
                boxNumber={c.boxNumber}
                customer={{ id: c.id, name: c.name, isPaid: isCustomerPaidThisMonth(c), isPartial: c.payments.find((p) => p.month === currentMonth && p.year === currentYear)?.status === "PARTIAL" }}
                onClick={() => handleBoxClick(c.boxNumber)}
              />
            ))
          ) : (
            Array.from({ length: totalBoxes }, (_, i) => i + 1).map((boxNum) => {
              const c = customerMap.get(boxNum);
              return (
                <CustomerBox
                  key={boxNum}
                  boxNumber={boxNum}
                  customer={c ? { id: c.id, name: c.name, isPaid: isCustomerPaidThisMonth(c), isPartial: c.payments.find((p) => p.month === currentMonth && p.year === currentYear)?.status === "PARTIAL" } : null}
                  onClick={() => handleBoxClick(boxNum)}
                />
              );
            })
          )}
        </motion.div>
      )}

      {isSearching && !isLoading && customers.length === 0 && (
        <div className="text-center py-20">
          <Search className="w-10 h-10 text-dark-700 mx-auto mb-3" />
          <p className="text-dark-400 font-medium">No customers found</p>
          <p className="text-dark-500 text-sm">Try a different name or box number</p>
        </div>
      )}

      {/* Add Customer Modal */}
      <AnimatePresence>
        {showModal && (
          <CustomerModal
            connectionType={connectionType}
            customer={selectedCustomer}
            defaultBoxNumber={addingToBox}
            onClose={() => { setShowModal(false); setAddingToBox(null); setSelectedCustomer(null); }}
            onSuccess={() => {
              setShowModal(false); setAddingToBox(null); setSelectedCustomer(null);
              queryClient.invalidateQueries({ queryKey: ["customers"] });
              queryClient.invalidateQueries({ queryKey: ["dashboard"] });
              toast.success(selectedCustomer ? "Customer updated!" : "Customer added!");
            }}
            onDelete={() => {
              setShowModal(false); setSelectedCustomer(null); setShowPayments(false);
              queryClient.invalidateQueries({ queryKey: ["customers"] });
              queryClient.invalidateQueries({ queryKey: ["dashboard"] });
              toast.success("Customer removed.");
            }}
          />
        )}
      </AnimatePresence>

      {/* Payment Panel */}
      <AnimatePresence>
        {showPayments && selectedCustomer && (
          <PaymentPanel
            customer={selectedCustomer}
            onClose={() => { setShowPayments(false); setSelectedCustomer(null); }}
            onEdit={() => { setShowPayments(false); setShowModal(true); }}
            onPaymentUpdate={() => {
              queryClient.invalidateQueries({ queryKey: ["customers"] });
              queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
