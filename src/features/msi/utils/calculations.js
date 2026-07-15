import { paidMonths, today } from "./dates";

const MONTH_LABELS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

export function enrichPurchase(purchase, billingDay) {
  const cutoffsPassed = paidMonths(purchase.date, billingDay);
  const paid = Math.min(cutoffsPassed, purchase.months);
  const installment = purchase.amount / purchase.months;
  const remaining = purchase.months - paid;
  const percentage = Math.round((paid / purchase.months) * 100);
  const completed = cutoffsPassed > purchase.months;

  return {
    ...purchase,
    paid,
    installment,
    remaining,
    percentage,
    completed,
  };
}

export function buildProjection(purchases, billingDay, monthsAhead = 12) {
  const now = today();

  return Array.from({ length: monthsAhead }, (_, index) => {
    const cutoff = new Date(
      now.getFullYear(),
      now.getMonth() + index,
      billingDay,
    );
    let total = 0;

    for (const purchase of purchases) {
      const purchaseDate = new Date(purchase.date + "T00:00:00");
      let firstCutoff = new Date(
        purchaseDate.getFullYear(),
        purchaseDate.getMonth(),
        billingDay,
      );
      if (firstCutoff <= purchaseDate) {
        firstCutoff = new Date(
          purchaseDate.getFullYear(),
          purchaseDate.getMonth() + 1,
          billingDay,
        );
      }

      const installmentNumber =
        (cutoff.getFullYear() - firstCutoff.getFullYear()) * 12 +
        (cutoff.getMonth() - firstCutoff.getMonth()) +
        1;

      if (installmentNumber >= 1 && installmentNumber <= purchase.months) {
        total += purchase.amount / purchase.months;
      }
    }

    return {
      month: `${MONTH_LABELS[cutoff.getMonth()]} ${String(cutoff.getFullYear()).slice(2)}`,
      total: Math.round(total * 100) / 100,
    };
  });
}

export function summarizePurchases(rows) {
  const active = rows.filter((row) => !row.completed);
  const history = rows.filter((row) => row.completed);
  const charging = active.filter((row) => row.paid >= 1);
  const monthlyTotal = charging.reduce((sum, row) => sum + row.installment, 0);
  const remainingTotal = active.reduce(
    (sum, row) => sum + row.installment * row.remaining,
    0,
  );

  return { active, history, monthlyTotal, remainingTotal };
}
