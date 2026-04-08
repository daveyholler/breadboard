import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Place, Position } from "@/types";
import { CLIENT_ID, shouldSkipSave } from "@/lib/syncClient";

interface BreadboardState {
  // Breadboard metadata
  breadboardId: string | null;
  breadboardName: string;
  isLoaded: boolean;
  isSaving: boolean;

  // Canvas data
  places: Place[];
  selectedPlaceId: string | null;

  // Breadboard actions
  loadBreadboard: (id: string) => Promise<void>;
  updateBreadboardName: (name: string) => void;
  resetStore: () => void;

  // Place actions
  addPlace: (name: string, position: Position) => void;
  updatePlaceName: (placeId: string, name: string) => void;
  movePlace: (placeId: string, position: Position) => void;
  removePlace: (placeId: string) => void;

  // Affordance actions
  addAffordance: (placeId: string, label: string) => void;
  updateAffordanceLabel: (
    placeId: string,
    affordanceId: string,
    label: string
  ) => void;
  connectAffordance: (
    placeId: string,
    affordanceId: string,
    targetPlaceId: string | null
  ) => void;
  removeAffordance: (placeId: string, affordanceId: string) => void;

  // Zoom & Pan
  zoom: number;
  setZoom: (zoom: number) => void;
  pan: Position;
  setPan: (pan: Position) => void;
  resetView: () => void;

  // UI actions
  selectPlace: (placeId: string | null) => void;
  hoveredPlaceId: string | null;
  setHoveredPlaceId: (placeId: string | null) => void;
  pendingFocus: "place-input" | "affordance-input" | null;
  setPendingFocus: (
    target: "place-input" | "affordance-input" | null
  ) => void;
}

const initialState = {
  breadboardId: null as string | null,
  breadboardName: "",
  isLoaded: false,
  isSaving: false,
  places: [] as Place[],
  selectedPlaceId: null as string | null,
  hoveredPlaceId: null as string | null,
  pendingFocus: null as "place-input" | "affordance-input" | null,
  zoom: 1,
  pan: { x: 0, y: 0 } as Position,
};

export const useBreadboardStore = create<BreadboardState>((set) => ({
  ...initialState,

  loadBreadboard: async (id) => {
    const res = await fetch(`/api/breadboards/${id}`);
    if (!res.ok) throw new Error("Breadboard not found");
    const data = await res.json();
    set({
      breadboardId: data.id,
      breadboardName: data.name,
      places: data.places,
      isLoaded: true,
      selectedPlaceId: null,
    });
  },

  updateBreadboardName: (name) => set({ breadboardName: name }),

  resetStore: () => set(initialState),

  addPlace: (name, position) =>
    set((state) => ({
      places: [
        ...state.places,
        { id: nanoid(), name, position, affordances: [] },
      ],
    })),

  updatePlaceName: (placeId, name) =>
    set((state) => ({
      places: state.places.map((p) =>
        p.id === placeId ? { ...p, name } : p
      ),
    })),

  movePlace: (placeId, position) =>
    set((state) => ({
      places: state.places.map((p) =>
        p.id === placeId ? { ...p, position } : p
      ),
    })),

  removePlace: (placeId) =>
    set((state) => ({
      places: state.places
        .filter((p) => p.id !== placeId)
        .map((p) => ({
          ...p,
          affordances: p.affordances.map((a) =>
            a.connectedToPlaceId === placeId
              ? { ...a, connectedToPlaceId: null }
              : a
          ),
        })),
      selectedPlaceId:
        state.selectedPlaceId === placeId ? null : state.selectedPlaceId,
    })),

  addAffordance: (placeId, label) =>
    set((state) => ({
      places: state.places.map((p) =>
        p.id === placeId
          ? {
              ...p,
              affordances: [
                ...p.affordances,
                { id: nanoid(), label, connectedToPlaceId: null },
              ],
            }
          : p
      ),
    })),

  updateAffordanceLabel: (placeId, affordanceId, label) =>
    set((state) => ({
      places: state.places.map((p) =>
        p.id === placeId
          ? {
              ...p,
              affordances: p.affordances.map((a) =>
                a.id === affordanceId ? { ...a, label } : a
              ),
            }
          : p
      ),
    })),

  connectAffordance: (placeId, affordanceId, targetPlaceId) => {
    if (targetPlaceId === placeId) return;
    set((state) => ({
      places: state.places.map((p) =>
        p.id === placeId
          ? {
              ...p,
              affordances: p.affordances.map((a) =>
                a.id === affordanceId
                  ? { ...a, connectedToPlaceId: targetPlaceId }
                  : a
              ),
            }
          : p
      ),
    }));
  },

  removeAffordance: (placeId, affordanceId) =>
    set((state) => ({
      places: state.places.map((p) =>
        p.id === placeId
          ? {
              ...p,
              affordances: p.affordances.filter((a) => a.id !== affordanceId),
            }
          : p
      ),
    })),

  setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 0.25), 3) }),
  setPan: (pan) => set({ pan }),
  resetView: () => set({ zoom: 1, pan: { x: 0, y: 0 } }),

  selectPlace: (placeId) => set({ selectedPlaceId: placeId }),
  setHoveredPlaceId: (placeId) => set({ hoveredPlaceId: placeId }),
  setPendingFocus: (target) => set({ pendingFocus: target }),
}));

// Auto-save: subscribe to store changes and debounce PUT requests
export function setupAutoSave(): () => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const unsubscribe = useBreadboardStore.subscribe((state, prevState) => {
    if (!state.breadboardId || !state.isLoaded) return;
    if (
      state.places === prevState.places &&
      state.breadboardName === prevState.breadboardName
    )
      return;
    if (shouldSkipSave()) return;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(async () => {
      const { breadboardId, places, breadboardName } =
        useBreadboardStore.getState();
      if (!breadboardId) return;

      useBreadboardStore.setState({ isSaving: true });
      try {
        await fetch(`/api/breadboards/${breadboardId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Client-Id": CLIENT_ID,
          },
          body: JSON.stringify({ places, name: breadboardName }),
        });
      } finally {
        useBreadboardStore.setState({ isSaving: false });
      }
    }, 500);
  });

  return () => {
    if (timeout) clearTimeout(timeout);
    unsubscribe();
  };
}
