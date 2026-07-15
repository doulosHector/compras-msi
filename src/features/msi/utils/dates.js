export const today = () => new Date();

/** Number of billing cutoff dates that have passed from purchase date until today */
export function paidMonths(purchaseDate, billingDay) {
  const purchase = new Date(purchaseDate + "T00:00:00");
  const now = today();
  let cutoff = new Date(purchase.getFullYear(), purchase.getMonth(), billingDay);
  if (cutoff <= purchase) {
    cutoff = new Date(purchase.getFullYear(), purchase.getMonth() + 1, billingDay);
  }
  let count = 0;
  while (cutoff <= now) {
    count++;
    cutoff = new Date(cutoff.getFullYear(), cutoff.getMonth() + 1, billingDay);
  }
  return count;
}

export function nextBillingDate(billingDay) {
  const now = today();
  let cutoff = new Date(now.getFullYear(), now.getMonth(), billingDay);
  if (cutoff <= now) {
    cutoff = new Date(now.getFullYear(), now.getMonth() + 1, billingDay);
  }
  return cutoff;
}
