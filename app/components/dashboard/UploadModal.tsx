"use client";

import { useState, type FormEvent } from "react";
import { IconClose, IconUploadCloud } from "./icons";

const sectors = ["Marine Vessel", "Offshore Rig", "Onshore Unit"] as const;

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export default function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [sector, setSector] = useState<(typeof sectors)[number]>("Marine Vessel");
  const [engineModel, setEngineModel] = useState("");
  const [vesselName, setVesselName] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  function resetForm() {
    setSector("Marine Vessel");
    setEngineModel("");
    setVesselName("");
    setFileName(null);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSuccess(`Document for ${engineModel} on [${vesselName}] was registered to the IDC vault.`);
    resetForm();
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-modal">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 id="modalTitle" className="text-headline-sm text-text-primary">
              Upload Engineering Document
            </h3>
            <p className="text-body-sm text-text-secondary">
              Attach CADs, engine logs, or vessel class certificates
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-placeholder transition hover:bg-surface-inset hover:text-text-primary"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-label-md text-text-primary">Asset Sector</label>
            <div className="grid grid-cols-3 gap-2">
              {sectors.map((s) => (
                <label
                  key={s}
                  className={`cursor-pointer rounded-lg border p-2.5 text-center text-label-sm font-medium transition ${
                    sector === s
                      ? "border-primary bg-primary text-white"
                      : "border-border text-text-primary hover:bg-surface-inset"
                  }`}
                >
                  <input
                    type="radio"
                    name="sector"
                    value={s}
                    checked={sector === s}
                    onChange={() => setSector(s)}
                    className="sr-only"
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="engineModel" className="mb-1 block text-label-md text-text-primary">
                Engine Spec
              </label>
              <input
                id="engineModel"
                type="text"
                required
                value={engineModel}
                onChange={(e) => setEngineModel(e.target.value)}
                placeholder="e.g. Wärtsilä 12V32"
                className="w-full rounded-lg border border-border p-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="vesselName" className="mb-1 block text-label-md text-text-primary">
                Vessel / Rig ID
              </label>
              <input
                id="vesselName"
                type="text"
                required
                value={vesselName}
                onChange={(e) => setVesselName(e.target.value)}
                placeholder="IMO 9384728"
                className="w-full rounded-lg border border-border p-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-label-md text-text-primary">
              Blueprints or Inspection Logs
            </label>
            <label
              htmlFor="hiddenFileInput"
              className="block cursor-pointer rounded-lg border-2 border-dashed border-border bg-surface-inset p-6 text-center transition hover:border-primary hover:bg-tertiary/40"
            >
              <IconUploadCloud className="mx-auto mb-2 h-8 w-8 text-placeholder" />
              <p className="text-label-md text-text-primary">Click or drag files here to upload</p>
              <p className="mt-1 text-[11px] text-placeholder">
                PDF, CAD/DWG, STEP, XLSX up to 50MB
              </p>
              <input
                id="hiddenFileInput"
                type="file"
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
              />
              {fileName ? (
                <div className="mt-2 text-label-sm font-semibold text-secondary">
                  Selected: {fileName}
                </div>
              ) : null}
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-label-md text-text-secondary transition hover:bg-surface-inset"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-5 py-2.5 text-label-md font-bold text-white shadow-card transition hover:bg-primary-hover"
            >
              Process &amp; Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
