"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";

export function UrlForm({
  onAnalyze,
  loading,
}: {
  onAnalyze: (url: string) => void;
  loading: boolean;
}) {
  const [url, setUrl] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    onAnalyze(url.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="url" className="mb-1.5 flex items-center gap-2 text-sm text-ink-dim">
          <Link2 className="h-4 w-4" /> URL to check
        </label>
        <Input
          id="url"
          type="text"
          placeholder="https://example.com/some-link"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="font-mono"
        />
      </div>
      <Button type="submit" disabled={loading || !url.trim()} className="w-full sm:w-auto">
        {loading ? "Analyzing…" : "Analyze URL"}
      </Button>
    </form>
  );
}
