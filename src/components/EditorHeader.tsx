"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useBreadboardStore } from "@/store/useBreadboardStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DeleteBreadboardDialog } from "@/components/DeleteBreadboardDialog";
import { Trash2 } from "lucide-react";

export function EditorHeader() {
  const breadboardId = useBreadboardStore((s) => s.breadboardId);
  const breadboardName = useBreadboardStore((s) => s.breadboardName);
  const updateBreadboardName = useBreadboardStore(
    (s) => s.updateBreadboardName
  );
  const setIsEditing = useBreadboardStore((s) => s.setIsEditing);
  const isSaving = useBreadboardStore((s) => s.isSaving);
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center gap-3 px-4 py-2 bg-background/80 backdrop-blur-sm border-b border-border">
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
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          className="max-w-xs text-center text-sm font-medium border-transparent hover:border-input focus:border-input bg-transparent"
          style={{ fontFamily: "var(--font-funnel-display)", fontWeight: 700 }}
        />
      </div>

      <div className="flex items-center gap-2">
        {breadboardId && (
          <DeleteBreadboardDialog
            breadboardId={breadboardId}
            breadboardName={breadboardName}
            trigger={
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            }
          />
        )}
        <Button variant="outline" size="sm" onClick={handleShare}>
          {copied ? "Copied!" : "Share"}
        </Button>
      </div>

      {isSaving && (
        <span className="absolute top-12 right-4 z-30 text-xs text-muted-foreground">
          Saving...
        </span>
      )}
    </header>
  );
}
