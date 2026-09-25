"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MetricsCharts from "./MetricsCharts";
import FinancialMetrics from "./FinancialMetrics";
import DocumentsTable from "./DocumentsTable";
import UploadModal, { type UploadInput } from "./UploadModal";
import { addDocument, deleteDocument, listDocuments, subscribeToChanges } from "../user/documentsRepo";
import type { UserDocument } from "../user/userData";

// Attribution for uploads made from the admin dashboard; the employee portal's
// uploads are attributed to `currentUser` from userData.ts. Both write to the
// same shared store (documentsRepo.ts) so either portal sees the other's uploads.
const ADMIN_UPLOADER = "IDC Swift Admin";

export default function Dashboard() {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [targetJobForUpload, setTargetJobForUpload] = useState<UserDocument | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    listDocuments().then((docs) => {
      setDocuments(docs);
      setLoading(false);
    });
    // picks up uploads/deletes made in the employee portal in another open tab
    return subscribeToChanges(() => {
      listDocuments().then(setDocuments);
    });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function handleUpload(input: UploadInput) {
    await addDocument(input, ADMIN_UPLOADER);
    const updated = await listDocuments();
    setDocuments(updated);
  }

  function handleAttachDoc(doc: UserDocument) {
    setTargetJobForUpload(doc);
    setUploadOpen(true);
  }

  async function handleDelete(doc: UserDocument) {
    await deleteDocument(doc.id);
    const updated = await listDocuments();
    setDocuments(updated);
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
              onUploadClick={() => {
                setTargetJobForUpload(null);
                setUploadOpen(true);
              }}
            />
            {/* Live document-processing rate + vault total charts */}
            <MetricsCharts documents={documents} />
            {/* Live financial analytics: revenue, profit, pipeline, sectors */}
            <FinancialMetrics documents={documents} />
            {/* WIP job table */}
            <DocumentsTable
              documents={documents}
              query={query}
              isLoading={isLoading}
              onDelete={handleDelete}
              onAttachDoc={handleAttachDoc}
            />
          </main>
        </div>
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => {
          setUploadOpen(false);
          setTargetJobForUpload(null);
        }}
        onSuccess={(message) => setToast(message)}
        onUpload={handleUpload}
        existingJobs={documents}
        targetJob={targetJobForUpload}
      />

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-lg border border-border bg-surface p-4 text-body-md text-text-primary shadow-modal">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
