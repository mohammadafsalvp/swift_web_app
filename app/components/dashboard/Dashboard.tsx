"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MetricsCharts from "./MetricsCharts";
import DocumentsTable from "./DocumentsTable";
import UploadModal, { type UploadInput } from "./UploadModal";
import { documents as seedDocuments, type DocumentRow } from "./data";
import { mergeWipFields } from "../../lib/documentExtraction";

export default function Dashboard() {
  const [documents, setDocuments] = useState<DocumentRow[]>(seedDocuments);
  const [query, setQuery] = useState("");
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function handleUpload(input: UploadInput) {
    const extracted = input.extractedFields;
    const wip = mergeWipFields(extracted, {
      contactName: "Unassigned",
      modelName: input.engineModel,
    });
    const row: DocumentRow = {
      ...wip,
      sNo: documents.length + 1,
      id: `#DOC-${Math.floor(1_000_000 + Math.random() * 9_000_000)}`,
      engineer: wip.contactName,
      flag: "",
      flagLabel: "",
      vessel: input.vesselName,
      engine: input.engineModel,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status: "review",
    };
    setDocuments((prev) => [row, ...prev]);
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8 md:py-8">
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12 xl:gap-7">
          <Sidebar />
          <main className="flex flex-col gap-6 xl:col-span-9">
            <TopBar
              query={query}
              onQueryChange={setQuery}
              onUploadClick={() => setUploadOpen(true)}
            />
            <MetricsCharts />
            <DocumentsTable documents={documents} query={query} />
          </main>
        </div>
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={(message) => setToast(message)}
        onUpload={handleUpload}
      />

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-lg border border-border bg-surface p-4 text-body-md text-text-primary shadow-modal">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
