"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar, { type SidebarItem } from "../dashboard/Sidebar";
import TopBar from "../dashboard/TopBar";
import UploadModal, { type UploadInput } from "../dashboard/UploadModal";
import { IconBlueprints, IconEngine, IconFolder, IconUploadCloud } from "../dashboard/icons";
import UserSummary from "./UserSummary";
import UserDocumentsTable from "./UserDocumentsTable";
import DocumentDetailPanel from "../dashboard/DocumentDetailPanel";
import { addDocument, downloadDocument, listDocuments } from "./documentsRepo";
import {
  categories,
  categoryLabel,
  currentUser,
  libraryTabs,
  type LibraryView,
  type UserDocument,
} from "./userData";

const sidebarItems: SidebarItem[] = [
  { key: "all", label: "All Documents", href: "#library", Icon: IconFolder },
  { key: "mine", label: "My Uploads", href: "#library", Icon: IconUploadCloud },
  { key: "blueprint", label: "Blueprints", href: "#library", Icon: IconBlueprints },
  { key: "engine-log", label: "Engine Repairs", href: "#library", Icon: IconEngine },
];

function matchesView(doc: UserDocument, view: LibraryView) {
  if (view === "all") return true;
  if (view === "mine") return doc.uploadedBy === currentUser.name;
  return doc.category === view;
}

function matchesQuery(doc: UserDocument, query: string) {
  if (!query) return true;
  const haystack = [
    doc.id,
    doc.fileName,
    doc.uploadedBy,
    doc.vessel,
    doc.engine,
    categoryLabel[doc.category],
    doc.customer,
    doc.jobNo,
    doc.serialNo,
    doc.assetId,
    doc.poNo,
    doc.invoiceNo,
    doc.scopeOfWork,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export default function UserPortal() {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [now, setNow] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<LibraryView>("all");
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<UserDocument | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    listDocuments().then((docs) => {
      setDocuments(docs);
      setNow(Date.now());
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const tabCounts = useMemo(
    () =>
      Object.fromEntries(
        libraryTabs.map((t) => [t.key, documents.filter((d) => matchesView(d, t.key)).length]),
      ) as Record<LibraryView, number>,
    [documents],
  );

  const visibleDocs = useMemo(
    () => documents.filter((d) => matchesView(d, view) && matchesQuery(d, query)),
    [documents, view, query],
  );

  async function handleUpload(input: UploadInput) {
    const doc = await addDocument(input);
    setDocuments((prev) => [doc, ...prev]);
  }

  async function handleDownload(doc: UserDocument) {
    await downloadDocument(doc);
    setToast(`Downloading ${doc.fileName}`);
  }

  function handleViewChange(next: LibraryView) {
    setView(next);
    document.getElementById("library")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8 md:py-8">
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12 xl:gap-7">
          <Sidebar
            items={sidebarItems}
            activeKey={view}
            onItemClick={(key) => handleViewChange(key as LibraryView)}
            footer={
              <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3.5 shadow-card">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tertiary text-label-md font-bold text-secondary">
                  {currentUser.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-label-md text-text-primary">{currentUser.name}</p>
                  <p className="truncate text-label-sm text-text-secondary">{currentUser.role}</p>
                </div>
                <span className="rounded-full border border-border bg-surface-inset px-2 py-0.5 text-label-sm text-text-secondary">
                  Employee
                </span>
              </div>
            }
          />
          <main className="flex flex-col gap-6 xl:col-span-9">
            <TopBar
              query={query}
              onQueryChange={setQuery}
              onUploadClick={() => setUploadOpen(true)}
              showExport={false}
            />
            <div>
              <h1 className="text-headline-lg text-text-primary">
                Welcome back, {currentUser.name.split(" ")[0]}
              </h1>
              <p className="text-body-lg text-text-secondary">
                Upload your engineering documents and access everything your team has shared.
              </p>
            </div>
            <UserSummary documents={documents} now={now} onDownload={handleDownload} />
            <div id="library" className="scroll-mt-6">
              <UserDocumentsTable
                documents={visibleDocs}
                tabCounts={tabCounts}
                view={view}
                onViewChange={setView}
                query={query}
                isLoading={isLoading}
                onPreview={setPreviewDoc}
                onDownload={handleDownload}
              />
            </div>
          </main>
        </div>
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={(message) => setToast(message)}
        onUpload={handleUpload}
        categories={categories}
      />

      <DocumentDetailPanel
        doc={previewDoc}
        onClose={() => setPreviewDoc(null)}
        onDownload={handleDownload}
      />

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-lg border border-border bg-surface p-4 text-body-md text-text-primary shadow-modal">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
