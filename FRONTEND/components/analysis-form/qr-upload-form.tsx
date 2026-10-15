"use client";

import { useState } from "react";
import { UploadZone } from "@/components/upload-zone/upload-zone";
import { Button } from "@/components/ui/button";

export function QrUploadForm({
  onAnalyze,
  loading,
}: {
  onAnalyze: (imageDataUrl: string) => void;
  loading: boolean;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  function readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else reject(new Error("Could not read the selected image."));
      };
      reader.onerror = () => reject(new Error("Could not read the selected image."));
      reader.readAsDataURL(file);
    });
  }

  async function handleAnalyze() {
    if (!selectedFile) return;
    setError(null);
    try {
      if (selectedFile.size > 5 * 1024 * 1024) {
        throw new Error("Please choose a QR image smaller than 5 MB.");
      }
      const dataUrl = await readAsDataUrl(selectedFile);
      onAnalyze(dataUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to read this image.");
    }
  }

  return (
    <div className="space-y-4">
      <UploadZone
        onFileSelected={(file) => {
          setSelectedFile(file);
          setError(null);
        }}
        onFileRemoved={() => {
          setSelectedFile(null);
          setError(null);
        }}
      />
      {error && <p role="alert" className="text-sm text-risk-high">{error}</p>}
      <Button
        onClick={handleAnalyze}
        disabled={loading || !selectedFile}
        className="w-full sm:w-auto"
      >
        {loading ? "Analyzing…" : "Analyze QR"}
      </Button>
    </div>
  );
}
