export type Vector2 = {
  x: number;
  y: number;
};

export type Rect2 = {
  x: number;
  y: number;
  width?: number;
  height?: number;
};

export type Command = {
  delay: number;
  id?: string;
  type: "tap" | "swipe" | "keyevent" | "text";
  args: string[];
};
