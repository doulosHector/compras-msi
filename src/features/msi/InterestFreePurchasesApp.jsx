import { styles } from "./styles";
import { usePurchases } from "./hooks/usePurchases";
import { AppHeader } from "./components/AppHeader";
import { SummarySection } from "./components/SummarySection";
import { TabNav } from "./components/TabNav";
import { PurchaseToolbar } from "./components/PurchaseToolbar";
import { ImportCsvModal } from "./components/ImportCsvModal";
import { PurchaseForm } from "./components/PurchaseForm";
import { ProjectionChart } from "./components/ProjectionChart";
import { PurchaseList } from "./components/PurchaseList";

export default function InterestFreePurchasesApp() {
  const {
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
  } = usePurchases();

  return (
    <div style={styles.page}>
      <style>{`
        .msi-input:hover { border-color: #3d6bce; }
        .msi-input:focus { outline: none; border-color: #3d6bce; box-shadow: 0 0 0 3px rgba(61,107,206,0.18); }
        .msi-input[type="search"]::-webkit-search-cancel-button { -webkit-appearance: none; appearance: none; }
      `}</style>
      <div style={styles.container}>
        <AppHeader
          billingDay={billingDay}
          onBillingDayChange={updateBillingDay}
        />

        <SummarySection
          monthlyTotal={monthlyTotal}
          remainingTotal={remainingTotal}
        />

        <TabNav
          tab={tab}
          onTabChange={setTab}
          activeCount={active.length}
          historyCount={history.length}
        />

        <PurchaseToolbar
          tab={tab}
          showForm={showForm}
          purchaseCount={purchases.length}
          oldestFirst={oldestFirst}
          search={search}
          onOpenNew={openNewPurchase}
          onOpenImport={() => {
            setShowImport(true);
            setImportError("");
          }}
          onToggleSort={() => setOldestFirst((value) => !value)}
          onSearchChange={setSearch}
        />

        {showImport && (
          <ImportCsvModal
            error={importError}
            onClose={() => setShowImport(false)}
            onImport={importCsv}
          />
        )}

        {showForm && (
          <PurchaseForm
            form={form}
            error={error}
            editingId={editingId}
            isEditing={Boolean(editingId)}
            onChange={setForm}
            onSubmit={savePurchase}
            onCancel={() => {
              setShowForm(false);
              setError("");
            }}
          />
        )}

        {tab === "projection" && <ProjectionChart data={projection} />}

        <PurchaseList
          tab={tab}
          list={list}
          baseListLength={baseList.length}
          search={search}
          searchText={searchText}
          showForm={showForm}
          onEdit={openEditPurchase}
          onDelete={deletePurchase}
        />
      </div>
    </div>
  );
}
