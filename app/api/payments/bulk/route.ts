import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/payments/bulk — mark selected payments by IDs
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { paymentIds, status, amountPaid, balance } = body;

  if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
    return NextResponse.json({ error: "paymentIds array is required" }, { status: 400 });
  }

  if (!status) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }

  if (status === "PAID" || status === "PARTIAL") {
    const payments = await prisma.payment.findMany({
      where: { id: { in: paymentIds } },
    });

    const finalAmountPaid = amountPaid !== undefined ? parseFloat(amountPaid) : undefined;
    const finalBalance = balance !== undefined ? parseFloat(balance) : undefined;

    let finalStatus = status;
    if (finalBalance !== undefined && finalAmountPaid !== undefined) {
      if (finalBalance === 0 && finalAmountPaid >= 0) {
        finalStatus = "PAID";
      } else if (finalBalance > 0 && finalAmountPaid > 0) {
        finalStatus = "PARTIAL";
      } else if (finalAmountPaid === 0 && finalBalance > 0) {
        finalStatus = "UNPAID";
      }
    }

    const updates = payments.map((p: any) => {
      return prisma.payment.update({
        where: { id: p.id },
        data: {
          status: finalStatus,
          amountPaid: finalAmountPaid !== undefined ? finalAmountPaid : p.amountPaid,
          balance: finalBalance !== undefined ? finalBalance : p.balance,
          paymentDate: p.paymentDate ?? new Date(),
        },
      });
    });

    const results = await Promise.all(updates);
    return NextResponse.json({ updated: results.length });
  }

  // UNPAID — reset everything
  const result = await prisma.payment.updateMany({
    where: { id: { in: paymentIds } },
    data: {
      status: "UNPAID",
      amountPaid: 0,
      balance: 0,
      paymentDate: null,
    },
  });

  return NextResponse.json({ updated: result.count });
}
