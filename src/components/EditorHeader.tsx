"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useBreadboardStore } from "@/store/useBreadboardStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function EditorHeader() {
  const breadboardName = useBreadboardStore((s) => s.breadboardName);
  const updateBreadboardName = useBreadboardStore(
    (s) => s.updateBreadboardName
  );
  const isSaving = useBreadboardStore((s) => s.isSaving);
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; All Breadboards
      </Link>

      <div className="flex-1 flex items-center justify-center">
        <Input
          value={breadboardName}
          onChange={(e) => updateBreadboardName(e.target.value)}
          className="max-w-xs text-center text-sm font-medium border-transparent hover:border-input focus:border-input bg-transparent"
          style={{ fontFamily: "var(--font-funnel-display)", fontWeight: 700 }}
        />
      </div>

      <div className="flex items-center gap-2">
        {isSaving && (
          <span className="text-xs text-muted-foreground">Saving...</span>
        )}
        <Button variant="outline" size="sm" onClick={handleShare}>
          {copied ? "Copied!" : "Share"}
        </Button>
      </div>
    </header>
  );
}
