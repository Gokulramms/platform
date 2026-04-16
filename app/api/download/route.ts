import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMonthName } from "@/utils/months";

// GET /api/download?type=INTERNET|CABLE — download as CSV
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // INTERNET | CABLE | null (all)
  const monthFilter = searchParams.get("month"); // 'current' or null
  const customerId = searchParams.get("customerId"); // specific customer or null
  
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  let paymentsWhere: any = {};
  if (monthFilter === "current") {
    paymentsWhere = { month: currentMonth, year: currentYear };
  }

  const customers = await prisma.customer.findMany({
    where: {
      ...(type ? { connectionType: type as "INTERNET" | "CABLE" } : {}),
      ...(customerId ? { id: customerId } : {})
    },
    include: {
      payments: {
        where: paymentsWhere,
        orderBy: [{ year: "asc" }, { month: "asc" }],
      },
    },
    orderBy: [{ connectionType: "asc" }, { boxNumber: "asc" }],
  });

  // Build CSV rows
  const rows: string[] = [];

  // Header
  rows.push(
    [
      "Box #",
      "Hardware Box ID",
      "Name",
      "Phone",
      "Address",
      "Connection Type",
      "Month",
      "Year",
      "Payment Status",
      "Amount Paid (₹)",
      "Balance (₹)",
      "Payment Date",
    ].join(",")
  );

  for (const customer of customers) {
    for (const payment of customer.payments) {
      rows.push(
        [
          customer.boxNumber,
          customer.hardwareId ? `"${customer.hardwareId}"` : "",
          `"${customer.name}"`,
          customer.phone,
          `"${customer.address.replace(/"/g, '""')}"`,
          customer.connectionType,
          getMonthName(payment.month),
          payment.year,
          payment.status,
          payment.amountPaid,
          payment.balance,
          payment.paymentDate
            ? new Date(payment.paymentDate).toLocaleDateString("en-IN")
            : "",
        ].join(",")
      );
    }
  }

  const csv = rows.join("\n");
  let filename = `all_customers_${new Date().toISOString().split("T")[0]}.csv`;
  if (customerId) {
    const cname = customers[0]?.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'customer';
    filename = `${cname}_history_${new Date().toISOString().split("T")[0]}.csv`;
  } else if (type) {
    filename = `${type.toLowerCase()}_customers_${new Date().toISOString().split("T")[0]}.csv`;
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
