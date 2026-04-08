"use client";

import { use, useEffect, useState } from "react";
import {
  useBreadboardStore,
  setupAutoSave,
} from "@/store/useBreadboardStore";
import { Canvas } from "@/components/Canvas";
import { FormPanel } from "@/components/FormPanel";
import { EditorHeader } from "@/components/EditorHeader";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";

export default function BreadboardEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const isLoaded = useBreadboardStore((s) => s.isLoaded);
  const loadBreadboard = useBreadboardStore((s) => s.loadBreadboard);
  const resetStore = useBreadboardStore((s) => s.resetStore);
  const breadboardId = useBreadboardStore((s) => s.breadboardId);
  const [error, setError] = useState(false);

  useRealtimeSync(breadboardId);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    loadBreadboard(id)
      .then(() => {
        cleanup = setupAutoSave();
      })
      .catch(() => {
        setError(true);
      });

    return () => {
      cleanup?.();
      resetStore();
    };
  }, [id, loadBreadboard, resetStore]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">Breadboard not found</p>
          <a href="/" className="text-sm text-blue-500 hover:underline">
            Back to all breadboards
          </a>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <main className="h-full w-full relative">
      <EditorHeader />
      <div className="h-full pt-11">
        <Canvas />
      </div>
      <FormPanel />
    </main>
  );
}
