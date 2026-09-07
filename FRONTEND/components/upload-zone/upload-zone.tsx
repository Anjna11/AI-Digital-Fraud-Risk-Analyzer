"use client";

import { useRef, useState } from "react";
import { UploadCloud, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function UploadZone({
  onFileSelected,
  onFileRemoved,
}: {
  onFileSelected: (file: File, previewUrl: string) => void;
  onFileRemoved: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setFileName(file.name);
    onFileSelected(file, url);
  }

  function handleRemove() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
    onFileRemoved();
  }

  if (preview) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-border bg-bg-elevated">
        <button
          type="button"
          onClick={handleRemove}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-bg/90 text-ink-dim hover:text-ink"
          aria-label="Remove image"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center justify-center p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Uploaded QR code preview"
            className="max-h-64 rounded-md border border-border object-contain"
          />
        </div>
        <div className="flex items-center gap-2 border-t border-border px-4 py-3 text-sm text-muted">
          <ImageIcon className="h-4 w-4" />
          {fileName}
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 text-center transition-colors",
        dragActive
          ? "border-accent bg-accent-soft"
          : "border-border-strong bg-bg-elevated hover:border-border-strong/80 hover:bg-surface"
      )}
    >
      <UploadCloud className="h-8 w-8 text-accent" />
      <div>
        <p className="text-sm font-medium text-ink">Drop a QR code image here</p>
        <p className="mt-1 text-xs text-muted">or click to browse — PNG, JPG</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
