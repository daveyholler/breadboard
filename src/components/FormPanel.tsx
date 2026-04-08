"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useBreadboardStore } from "@/store/useBreadboardStore";
import { Field } from "@base-ui/react/field";
import { Fieldset } from "@base-ui/react/fieldset";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export function FormPanel() {
  const places = useBreadboardStore((s) => s.places);
  const selectedPlaceId = useBreadboardStore((s) => s.selectedPlaceId);
  const addPlace = useBreadboardStore((s) => s.addPlace);
  const updatePlaceName = useBreadboardStore((s) => s.updatePlaceName);
  const removePlace = useBreadboardStore((s) => s.removePlace);
  const addAffordance = useBreadboardStore((s) => s.addAffordance);
  const updateAffordanceLabel = useBreadboardStore(
    (s) => s.updateAffordanceLabel
  );
  const connectAffordance = useBreadboardStore((s) => s.connectAffordance);
  const removeAffordance = useBreadboardStore((s) => s.removeAffordance);
  const selectPlace = useBreadboardStore((s) => s.selectPlace);
  const pendingFocus = useBreadboardStore((s) => s.pendingFocus);
  const setPendingFocus = useBreadboardStore((s) => s.setPendingFocus);
  const setIsEditing = useBreadboardStore((s) => s.setIsEditing);

  const [newPlaceName, setNewPlaceName] = useState("");
  const [newAffordanceLabel, setNewAffordanceLabel] = useState("");

  const placeInputRef = useRef<HTMLInputElement>(null);
  const affordanceInputRef = useRef<HTMLInputElement>(null);

  const selectedPlace = places.find((p) => p.id === selectedPlaceId);

  // Handle pending focus from keyboard shortcuts
  useEffect(() => {
    if (!pendingFocus) return;
    // Use rAF to wait for render after state changes
    const frame = requestAnimationFrame(() => {
      if (pendingFocus === "place-input") {
        placeInputRef.current?.focus();
      } else if (pendingFocus === "affordance-input") {
        affordanceInputRef.current?.focus();
      }
      setPendingFocus(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [pendingFocus, setPendingFocus]);

  const handleAddPlace = useCallback(() => {
    if (!newPlaceName.trim()) return;
    const col = places.length % 4;
    const row = Math.floor(places.length / 4);
    addPlace(newPlaceName.trim(), { x: 80 + col * 220, y: 80 + row * 180 });
    setNewPlaceName("");
  }, [newPlaceName, addPlace, places.length]);

  const handleAddAffordance = useCallback(() => {
    if (!newAffordanceLabel.trim() || !selectedPlaceId) return;
    addAffordance(selectedPlaceId, newAffordanceLabel.trim());
    setNewAffordanceLabel("");
  }, [newAffordanceLabel, selectedPlaceId, addAffordance]);

  return (
    <div
      className={`absolute bottom-4 right-4 z-10 w-[320px] transition-[top] duration-200 ease-in-out ${
        selectedPlace ? "top-4" : "top-[calc(100vh-1rem-140px)]"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <Card className="shadow-lg flex flex-col h-full">
        <CardHeader className="pb-3 shrink-0">
          <CardTitle className="text-sm font-medium">
            {selectedPlace ? "Edit Place" : "Breadboard"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          {!selectedPlace ? (
            <Field.Root>
              <div className="flex gap-2 align-center m-2">
                <Field.Control
                  ref={placeInputRef}
                  render={<Input />}
                  placeholder="Place name..."
                  value={newPlaceName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewPlaceName(e.target.value)
                  }
                  onKeyDown={(e: React.KeyboardEvent) =>
                    e.key === "Enter" && handleAddPlace()
                  }
                  className="text-sm"
                />
                <Button size="sm" onClick={handleAddPlace}>
                  Add
                </Button>
              </div>
            </Field.Root>
          ) : (
            <ScrollArea className="h-full">
              <div className="space-y-4 pr-2">
                {/* Place name */}
                <Field.Root className="space-y-5 mx-2">
                  <Field.Label className="text-xs text-muted-foreground">
                    Name
                  </Field.Label>
                  <Field.Control
                    render={<Input />}
                    value={selectedPlace.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updatePlaceName(selectedPlace.id, e.target.value)
                    }
                    onFocus={() => setIsEditing(true)}
                    onBlur={() => setIsEditing(false)}
                    className="text-sm"
                  />
                </Field.Root>

                <Separator />

                {/* Affordances */}
                <Fieldset.Root className="space-y-4 mx-1">
                  <Fieldset.Legend className="text-xs text-muted-foreground font-medium">
                    Affordances
                  </Fieldset.Legend>

                  <div className="grid grid-cols-2">
                    <span>Name</span>
                    <span>Connection</span>
                  </div>
                  {selectedPlace.affordances.map((affordance) => (
                    <div
                      key={affordance.id}
                      className="grid grid-cols-2 gap-1.5 items-center"
                    >
                      <Field.Root className="flex-1 min-w-0">
                        <Field.Control
                          render={<Input />}
                          value={affordance.label}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) =>
                            updateAffordanceLabel(
                              selectedPlace.id,
                              affordance.id,
                              e.target.value
                            )
                          }
                          onFocus={() => setIsEditing(true)}
                          onBlur={() => setIsEditing(false)}
                          className="text-sm h-8"
                        />
                      </Field.Root>
                      <div className="flex gap-1.5">
                        <Select
                          value={affordance.connectedToPlaceId ?? "none"}
                          onValueChange={(value) =>
                            connectAffordance(
                              selectedPlace.id,
                              affordance.id,
                              !value || value === "none" ? null : value
                            )
                          }
                        >
                          <SelectTrigger className="h-8 text-xs w-[100px] shrink-0">
                            <span className="truncate">
                              {affordance.connectedToPlaceId
                                ? places.find(
                                  (p) =>
                                    p.id === affordance.connectedToPlaceId
                                )?.name ?? "Unknown"
                                : "None"}
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No connection</SelectItem>
                            {places
                              .filter((p) => p.id !== selectedPlace.id)
                              .map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                          onClick={() =>
                            removeAffordance(selectedPlace.id, affordance.id)
                          }
                        >
                          &times;
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Add affordance */}
                  <div className="flex gap-2">
                    <Field.Root className="flex-1">
                      <Field.Control
                        ref={affordanceInputRef}
                        render={<Input />}
                        placeholder="Affordance label..."
                        value={newAffordanceLabel}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewAffordanceLabel(e.target.value)
                        }
                        onKeyDown={(e: React.KeyboardEvent) =>
                          e.key === "Enter" && handleAddAffordance()
                        }
                        className="text-sm h-8"
                      />
                    </Field.Root>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={handleAddAffordance}
                    >
                      Add
                    </Button>
                  </div>
                </Fieldset.Root>

                <Separator />

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => selectPlace(null)}
                  >
                    Done
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => removePlace(selectedPlace.id)}
                  >
                    Delete Place
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
