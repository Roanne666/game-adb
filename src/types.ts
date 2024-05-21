import type { CommandBase } from "./command";

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

export type CommandOptions = {
  preDelay?: number;
  postDelay?: number;
};

export type TaskOptions = {
  name: string;
  commands: CommandBase[];
  preDelay?: number;
  postDelay?: number;
  next?: string;
  handler?: () => Promise<boolean> | boolean;
};
