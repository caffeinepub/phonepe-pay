/**
 * Format a bigint amount (in rupees) as ₹X,XXX
 */
export function formatRupees(amount: bigint): string {
  const num = Number(amount);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Convert nanosecond timestamp (bigint) to a readable date string
 */
export function formatTimestamp(nanos: bigint): string {
  const ms = Number(nanos / BigInt(1_000_000));
  const date = new Date(ms);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Convert nanosecond timestamp (bigint) to time string
 */
export function formatTimestampTime(nanos: bigint): string {
  const ms = Number(nanos / BigInt(1_000_000));
  const date = new Date(ms);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Generate a short transaction ID from bigint id
 */
export function formatTransactionId(id: bigint): string {
  return `TXN${String(id).padStart(9, "0")}`;
}
