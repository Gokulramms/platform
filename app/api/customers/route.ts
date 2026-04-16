import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePaymentMonths } from "@/utils/months";

// GET /api/customers
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // INTERNET | CABLE
  const search = searchParams.get("search") || "";
  const filter = searchParams.get("filter"); // paid | unpaid

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const where: Record<string, unknown> = {};

  if (type) where.connectionType = type;

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { boxNumber: isNaN(parseInt(search)) ? undefined : parseInt(search) },
    ];
  }

  const customers = await prisma.customer.findMany({
    where,
    include: {
      payments: {
        where: { month: currentMonth, year: currentYear },
        select: { id: true, status: true, paymentDate: true, month: true, year: true },
      },
    },
    orderBy: { boxNumber: "asc" },
  });

  // Apply paid/unpaid filter based on current month
  let result = customers;
  if (filter === "paid") {
    result = customers.filter(
      (c: any) => c.payments[0]?.status === "PAID"
    );
  } else if (filter === "unpaid") {
    result = customers.filter(
      (c: any) => !c.payments[0] || c.payments[0]?.status === "UNPAID"
    );
  }

  return NextResponse.json(result);
}

// POST /api/customers
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, phone, address, connectionType, boxNumber, hardwareId } = body;

  if (!name || !phone || !address || !connectionType || !boxNumber || !hardwareId) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (hardwareId.length < 10 || hardwareId.length > 20) {
    return NextResponse.json({ error: "Hardware ID must be between 10 and 20 characters" }, { status: 400 });
  }

  // Check if box is already taken
  const existing = await prisma.customer.findUnique({
    where: { connectionType_boxNumber: { connectionType, boxNumber: parseInt(boxNumber) } },
  });

  if (existing) {
    return NextResponse.json({ error: "This box is already assigned to another customer" }, { status: 409 });
  }

  // Create customer
  const customer = await prisma.customer.create({
    data: {
      name,
      phone,
      address,
      connectionType,
      boxNumber: parseInt(boxNumber),
      hardwareId,
      planAmount: 0,
    },
  });

  // Auto-generate payment records for current year up to current month
  const paymentRecords = generatePaymentMonths(customer.id);

  await prisma.payment.createMany({
    data: paymentRecords,
    skipDuplicates: true,
  });

  return NextResponse.json(customer, { status: 201 });
}
