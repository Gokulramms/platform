import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/dashboard — stats for the dashboard home
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [
    totalInternet,
    totalCable,
    paidThisMonth,
    unpaidThisMonth,
    recentPayments,
  ] = await Promise.all([
    prisma.customer.count({ where: { connectionType: "INTERNET" } }),
    prisma.customer.count({ where: { connectionType: "CABLE" } }),
    prisma.payment.count({
      where: { month: currentMonth, year: currentYear, status: "PAID" },
    }),
    prisma.payment.count({
      where: { month: currentMonth, year: currentYear, status: "UNPAID" },
    }),
    prisma.payment.findMany({
      where: { status: "PAID", paymentDate: { not: null } },
      orderBy: { paymentDate: "desc" },
      take: 5,
      include: {
        customer: { select: { name: true, connectionType: true, boxNumber: true } },
      },
    }),
  ]);

  const totalCustomers = totalInternet + totalCable;
  const totalThisMonth = paidThisMonth + unpaidThisMonth;
  const paidPercent = totalThisMonth > 0 ? Math.round((paidThisMonth / totalThisMonth) * 100) : 0;

  return NextResponse.json({
    totalCustomers,
    totalInternet,
    totalCable,
    paidThisMonth,
    unpaidThisMonth,
    paidPercent,
    currentMonth,
    currentYear,
    recentPayments,
  });
}
