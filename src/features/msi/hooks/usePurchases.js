import { useState } from "react";
import { loadSavedData, saveData } from "../utils/storage";
import { parsePurchasesCsv } from "../utils/csv";
import {
  enrichPurchase,
  buildProjection,
  summarizePurchases,
} from "../utils/calculations";

const emptyForm = {
  name: "",
  amount: "",
  months: "",
  date: "",
};

export function usePurchases() {
  const [savedData] = useState(loadSavedData);
  const [purchases, setPurchases] = useState(savedData.purchases);
  const [billingDay, setBillingDay] = useState(savedData.billingDay);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState("current");
  const [showImport, setShowImport] = useState(false);
  const [importError, setImportError] = useState("");
  const [oldestFirst, setOldestFirst] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);

  function persist(nextPurchases, nextBillingDay = billingDay) {
    setPurchases(nextPurchases);
    setBillingDay(nextBillingDay);
    saveData(nextPurchases, nextBillingDay);
  }

  function clearForm() {
    setForm({
      ...emptyForm,
      date: new Date().toISOString().slice(0, 10),
    });
  }

  function openNewPurchase() {
    clearForm();
    setEditingId(null);
    setShowForm(true);
    setError("");
  }

  function openEditPurchase(purchase) {
    setForm({
      name: purchase.name,
      amount: String(purchase.amount),
      months: String(purchase.months),
      date: purchase.date,
    });
    setEditingId(purchase.id);
    setShowForm(true);
    setError("");
  }

  function savePurchase() {
    const amount = parseFloat(form.amount);
    const months = parseInt(form.months, 10);

    if (!form.name.trim()) {
      return setError("Escribe un nombre para la compra.");
    }
    if (!amount || amount <= 0) {
      return setError("El monto debe ser mayor a cero.");
    }
    if (!months || months <= 0) {
      return setError("El número de meses debe ser mayor a cero.");
    }
    if (!form.date) {
      return setError("Selecciona la fecha de compra.");
    }

    setError("");

    if (editingId) {
      persist(
        purchases.map((purchase) =>
          purchase.id === editingId
            ? {
                ...purchase,
                name: form.name.trim(),
                amount,
                months,
                date: form.date,
              }
            : purchase,
        ),
      );
    } else {
      persist([
        ...purchases,
        {
          id: Date.now().toString(36),
          name: form.name.trim(),
          amount,
          months,
          date: form.date,
        },
      ]);
    }

    setShowForm(false);
  }

  function deletePurchase(id) {
    persist(purchases.filter((purchase) => purchase.id !== id));
  }

  function importCsv(file) {
    setImportError("");
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const nextPurchases = parsePurchasesCsv(reader.result);
        persist(nextPurchases);
        setShowImport(false);
      } catch (err) {
        setImportError(err.message || "No se pudo leer el archivo.");
      }
    };

    reader.onerror = () => setImportError("No se pudo leer el archivo.");
    reader.readAsText(file);
  }

  function updateBillingDay(day) {
    persist(purchases, day);
  }

  const rows = purchases.map((purchase) =>
    enrichPurchase(purchase, billingDay),
  );
  const { active, history, monthlyTotal, remainingTotal } =
    summarizePurchases(rows);
  const projection = buildProjection(purchases, billingDay);

  const baseList = tab === "current" ? active : history;
  const searchText = search.trim().toLowerCase();
  const list = [...baseList]
    .filter(
      (purchase) =>
        !searchText || purchase.name.toLowerCase().includes(searchText),
    )
    .sort((a, b) => {
      const comparison =
        a.date.localeCompare(b.date) || a.id.localeCompare(b.id);
      return oldestFirst ? comparison : -comparison;
    });

  return {
    purchases,
    billingDay,
    error,
    setError,
    editingId,
    showForm,
    setShowForm,
    tab,
    setTab,
    showImport,
    setShowImport,
    importError,
    setImportError,
    oldestFirst,
    setOldestFirst,
    search,
    setSearch,
    form,
    setForm,
    openNewPurchase,
    openEditPurchase,
    savePurchase,
    deletePurchase,
    importCsv,
    updateBillingDay,
    active,
    history,
    monthlyTotal,
    remainingTotal,
    projection,
    baseList,
    searchText,
    list,
  };
}
