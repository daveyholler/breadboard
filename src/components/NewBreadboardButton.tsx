"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewBreadboardButton() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/breadboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      router.push(`/b/${data.id}`);
    } catch {
      setLoading(false);
    }
  }, [name, router]);

  if (!isCreating) {
    return (
      <Button onClick={() => setIsCreating(true)}>New Breadboard</Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Breadboard name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        autoFocus
        className="max-w-xs"
      />
      <Button onClick={handleCreate} disabled={loading || !name.trim()}>
        {loading ? "Creating..." : "Create"}
      </Button>
      <Button
        variant="ghost"
        onClick={() => {
          setIsCreating(false);
          setName("");
        }}
      >
        Cancel
      </Button>
    </div>
  );
}
