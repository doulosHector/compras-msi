const memoryFallback = {};

export const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return memoryFallback[key] ?? null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      memoryFallback[key] = value;
    }
  },
};

const STORAGE_KEY = "msi-datos";

function normalizePurchase(purchase) {
  return {
    id: purchase.id,
    name: purchase.name ?? purchase.nombre,
    amount: purchase.amount ?? purchase.monto,
    months: purchase.months ?? purchase.meses,
    date: purchase.date ?? purchase.fecha,
  };
}

export function loadSavedData() {
  try {
    const raw = storage.get(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return {
        purchases: (data.purchases || data.compras || []).map(normalizePurchase),
        billingDay: data.billingDay ?? data.diaCorte ?? 1,
      };
    }
  } catch {
    // No previous data or corrupt data
  }
  return { purchases: [], billingDay: 1 };
}

export function saveData(purchases, billingDay) {
  storage.set(
    STORAGE_KEY,
    JSON.stringify({ purchases, billingDay }),
  );
}
