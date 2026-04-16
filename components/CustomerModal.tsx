"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, User, Phone, MapPin, Hash, IndianRupee, Save, Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
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
}

interface CustomerModalProps {
  connectionType: "INTERNET" | "CABLE";
  customer: Customer | null;
  defaultBoxNumber?: number | null;
  onClose: () => void;
  onSuccess: () => void;
  onDelete: () => void;
}

export function CustomerModal({
  connectionType,
  customer,
  defaultBoxNumber,
  onClose,
  onSuccess,
  onDelete,
}: CustomerModalProps) {
  const isEditing = !!customer;

  const [form, setForm] = useState({
    name: customer?.name ?? "",
    phone: customer?.phone ?? "",
    address: customer?.address ?? "",
    boxNumber: customer?.boxNumber?.toString() ?? defaultBoxNumber?.toString() ?? "",
    hardwareId: customer?.hardwareId ?? "",
    planAmount: customer?.planAmount?.toString() ?? "",
  });

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isEditing) {
        const res = await fetch(`/api/customers/${customer.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? "Failed to update"); }
        return res.json();
      } else {
        const res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, connectionType }),
        });
        if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? "Failed to add"); }
        return res.json();
      }
    },
    onSuccess,
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/customers/${customer!.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: onDelete,
    onError: () => toast.error("Failed to delete customer"),
  });

  const typeColor = connectionType === "INTERNET" ? "brand" : "purple";
  const typeBadge = connectionType === "INTERNET"
    ? "bg-brand-600/20 text-brand-300 border-brand-600/30"
    : "bg-purple-600/20 text-purple-300 border-purple-600/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-dark-800 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              {isEditing ? "Edit Customer" : `Add to Box ${defaultBoxNumber}`}
            </h2>
            <span className={`inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${typeBadge}`}>
              {connectionType === "INTERNET" ? "📡 Internet" : "📺 Cable TV"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 w-8 h-8 rounded-lg bg-dark-800 hover:bg-dark-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-dark-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="px-6 py-5 space-y-4">

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                id="customer-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Rajesh Kumar"
                className="w-full bg-dark-800 border border-dark-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-4 py-3 pl-10 text-white text-sm placeholder-dark-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                id="customer-phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="e.g. 9876543210"
                className="w-full bg-dark-800 border border-dark-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-4 py-3 pl-10 text-white text-sm placeholder-dark-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Box Number (read-only after set) */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">
                Box Number *
              </label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  id="customer-box"
                  name="boxNumber"
                  type="number"
                  min={1}
                  value={form.boxNumber}
                  onChange={handleChange}
                  required
                  disabled={isEditing}
                  className="w-full bg-dark-800 border border-dark-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-4 py-3 pl-10 text-white text-sm placeholder-dark-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              {isEditing && <p className="text-xs text-dark-500 mt-1">Box number cannot be changed.</p>}
            </div>

            {/* Hardware Box ID */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">
                Hardware Box ID *
              </label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  id="customer-hardware-id"
                  name="hardwareId"
                  type="text"
                  value={form.hardwareId}
                  onChange={handleChange}
                  required
                  minLength={10}
                  maxLength={20}
                  placeholder="e.g. STB-12345"
                  className="w-full bg-dark-800 border border-dark-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-4 py-3 pl-10 text-white text-sm placeholder-dark-500 outline-none transition-all"
                />
              </div>
              <p className="text-[10px] text-dark-500 mt-1">10 to 20 characters required</p>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">
              Address *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-dark-500" />
              <textarea
                id="customer-address"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                rows={2}
                placeholder="Full address"
                className="w-full bg-dark-800 border border-dark-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-4 py-3 pl-10 text-white text-sm placeholder-dark-500 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {isEditing && !confirmDelete && (
              <button
                type="button"
                id="delete-btn"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-900/50 text-red-400 hover:bg-red-900/20 hover:border-red-700 text-sm font-medium transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            {confirmDelete && (
              <button
                type="button"
                id="confirm-delete-btn"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-all"
              >
                {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
              </button>
            )}
            {!confirmDelete && (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-700 border border-dark-700 text-dark-200 text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-customer-btn"
                  disabled={saveMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold transition-all disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {saveMutation.isPending ? "Saving..." : isEditing ? "Save Changes" : "Add Customer"}
                </button>
              </>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
