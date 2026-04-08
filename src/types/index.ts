export interface Position {
  x: number;
  y: number;
}

export interface Affordance {
  id: string;
  label: string;
  connectedToPlaceId: string | null;
}

export interface Place {
  id: string;
  name: string;
  position: Position;
  affordances: Affordance[];
}

export interface Breadboard {
  id: string;
  name: string;
  places: Place[];
  created_at: string;
  updated_at: string;
}

export interface BreadboardSummary {
  id: string;
  name: string;
  updated_at: string;
}
