"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export function MessageForm({
  onAnalyze,
  loading,
}: {
  onAnalyze: (message: string) => void;
  loading: boolean;
}) {
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    onAnalyze(message.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="message" className="mb-1.5 flex items-center gap-2 text-sm text-ink-dim">
          <MessageSquare className="h-4 w-4" /> Message to check
        </label>
        <Textarea
          id="message"
          rows={5}
          placeholder="Paste the SMS, email, or chat message here…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading || !message.trim()} className="w-full sm:w-auto">
        {loading ? "Analyzing…" : "Analyze message"}
      </Button>
    </form>
  );
}
