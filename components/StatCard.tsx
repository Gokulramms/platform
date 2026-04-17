import { cn } from "@/utils/cn";
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: "brand" | "blue" | "purple" | "green" | "red";
  loading?: boolean;
  href?: string;
}

const colorMap = {
  brand: {
    bg: "bg-brand-600/15",
    border: "border-brand-600/30",
    icon: "bg-brand-600/20 text-brand-600",
    value: "text-brand-700",
  },
  blue: {
    bg: "bg-blue-600/15",
    border: "border-blue-600/30",
    icon: "bg-blue-600/20 text-blue-400",
    value: "text-blue-300",
  },
  purple: {
    bg: "bg-purple-600/15",
    border: "border-purple-600/30",
    icon: "bg-purple-600/20 text-purple-400",
    value: "text-purple-300",
  },
  green: {
    bg: "bg-green-600/15",
    border: "border-green-600/30",
    icon: "bg-green-600/20 text-green-600",
    value: "text-green-600",
  },
  red: {
    bg: "bg-red-600/15",
    border: "border-red-600/30",
    icon: "bg-red-600/20 text-red-600",
    value: "text-red-600",
  },
};

export function StatCard({ title, value, subtitle, icon, color, loading, href }: StatCardProps) {
  const colors = colorMap[color];

  const content = (
    <div
      className={cn(
        "glass rounded-2xl p-5 border transition-all duration-200",
        colors.border,
        href && "hover:scale-[1.02] cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colors.icon)}>
          {icon}
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-8 w-24 bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <p className={cn("text-3xl font-bold", colors.value)}>{value}</p>
          {subtitle && <p className="text-slate-600 text-xs mt-0.5">{subtitle}</p>}
          <p className="text-slate-700 text-sm mt-1">{title}</p>
        </>
      )}
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}
