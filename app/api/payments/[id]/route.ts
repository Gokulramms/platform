import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/payments/[id] — toggle or set partial payment
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { status, amountPaid, balance } = body;

  const payment = await prisma.payment.findUnique({
    where: { id: params.id },
  });

  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  let finalStatus = status;
  let finalAmountPaid = amountPaid !== undefined ? parseFloat(amountPaid) : payment.amountPaid;
  let finalBalance = balance !== undefined ? parseFloat(balance) : payment.balance;

  if (status === "PAID") {
    if (finalBalance === 0 && finalAmountPaid >= 0) {
      finalStatus = "PAID";
    } else if (finalBalance > 0 && finalAmountPaid > 0) {
      finalStatus = "PARTIAL";
    } else if (finalAmountPaid === 0 && finalBalance > 0) {
      finalStatus = "UNPAID";
    }
  }

  if (status === "UNPAID") {
    finalAmountPaid = 0;
    finalBalance = 0; // We might want to keep the balance as 0 or the plan amount. We can just set balance back to 0.
  }

  const updated = await prisma.payment.update({
    where: { id: params.id },
    data: {
      status: finalStatus,
      amountPaid: finalAmountPaid,
      balance: finalBalance,
      paymentDate: finalStatus === "UNPAID" ? null : (payment.paymentDate ?? new Date()),
    },
  });

  return NextResponse.json(updated);
}
