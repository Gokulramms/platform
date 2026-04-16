export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Business start date — all customers have payments from here */
export const BUSINESS_START_YEAR = 2026;
export const BUSINESS_START_MONTH = 1; // January

/**
 * Generate payment records from Jan 2026 to December of current year.
 * This gives a full calendar view including future months for advance payments.
 */
export function generatePaymentMonths(
  customerId: string
): Array<{ customerId: string; month: number; year: number; status: "UNPAID"; amountPaid: number }> {
  const records: Array<{ customerId: string; month: number; year: number; status: "UNPAID"; amountPaid: number }> = [];
  const currentYear = new Date().getFullYear();

  for (let year = BUSINESS_START_YEAR; year <= currentYear; year++) {
    const startMonth = year === BUSINESS_START_YEAR ? BUSINESS_START_MONTH : 1;
    for (let month = startMonth; month <= 12; month++) {
      records.push({ customerId, month, year, status: "UNPAID", amountPaid: 0 });
    }
  }

  return records;
}

/**
 * Returns all months that should exist for a customer,
 * used to detect and fill in missing payment records.
 */
export function getAllExpectedMonths(): Array<{ month: number; year: number }> {
  const result: Array<{ month: number; year: number }> = [];
  const currentYear = new Date().getFullYear();

  for (let year = BUSINESS_START_YEAR; year <= currentYear; year++) {
    const startMonth = year === BUSINESS_START_YEAR ? BUSINESS_START_MONTH : 1;
    for (let month = startMonth; month <= 12; month++) {
      result.push({ month, year });
    }
  }

  return result;
}

export function getMonthName(month: number, short = false): string {
  return short ? MONTHS_SHORT[month - 1] : MONTHS[month - 1];
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}
