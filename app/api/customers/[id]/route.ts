import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAllExpectedMonths } from "@/utils/months";

// GET /api/customers/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      payments: {
        orderBy: [{ year: "asc" }, { month: "asc" }],
      },
    },
  });

  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  // Auto-generate any missing payment records from Jan 2026 to end of current year
  const expectedMonths = getAllExpectedMonths();
  const existingKeys = new Set(
    customer.payments.map((p: any) => `${p.year}-${p.month}`)
  );

  const missing = expectedMonths.filter(
    ({ month, year }) => !existingKeys.has(`${year}-${month}`)
  );

  if (missing.length > 0) {
    await prisma.payment.createMany({
      data: missing.map(({ month, year }) => ({
        customerId: customer.id,
        month,
        year,
        status: "UNPAID",
        amountPaid: 0,
      })),
      skipDuplicates: true,
    });

    // Re-fetch with updated payments
    const updated = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        payments: {
          orderBy: [{ year: "asc" }, { month: "asc" }],
        },
      },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json(customer);
}

// PUT /api/customers/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, phone, address, hardwareId } = body;

  if (hardwareId && (hardwareId.length < 10 || hardwareId.length > 20)) {
    return NextResponse.json({ error: "Hardware ID must be between 10 and 20 characters" }, { status: 400 });
  }

  const customer = await prisma.customer.update({
    where: { id: params.id },
    data: {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(address && { address }),
      ...(hardwareId && { hardwareId }),
    },
  });

  return NextResponse.json(customer);
}

// DELETE /api/customers/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.customer.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
