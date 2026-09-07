"use client";

import { useState } from "react";
import { UploadZone } from "@/components/upload-zone/upload-zone";
import { Button } from "@/components/ui/button";

export function QrUploadForm({
  onAnalyze,
  loading,
}: {
  onAnalyze: (fileName: string) => void;
  loading: boolean;
}) {
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <UploadZone
        onFileSelected={(file) => setFileName(file.name)}
        onFileRemoved={() => setFileName(null)}
      />
      <Button
        onClick={() => fileName && onAnalyze(fileName)}
        disabled={loading || !fileName}
        className="w-full sm:w-auto"
      >
        {loading ? "Analyzing…" : "Analyze QR"}
      </Button>
    </div>
  );
}
