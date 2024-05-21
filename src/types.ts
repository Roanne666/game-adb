import type { CommandBase } from "./command";
import { Device } from "./device";

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
  times?: number;
  preDelay?: number;
  postDelay?: number;
  next?: string[];
  handler?: (device: Device) => Promise<boolean> | boolean;
};
