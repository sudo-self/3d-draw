export interface Point {
  x: number;
  y: number;
  z: number;
}

export interface Line {
  points: Point[];
  color: string;
}