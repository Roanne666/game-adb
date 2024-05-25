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

export type CommandChecker = {
  name?: string;
  handler: (device: Device) => Promise<boolean> | boolean;
};

export enum CommandLifeCycle {
  "command_start" = "command_start",
  "command_finish" = "command_finish",
  "check_pass" = "check_pass",
  "check_fail" = "check_fail",
}

export type CommandOptions = {
  preDelay?: number;
  postDelay?: number;
  checker?: CommandChecker;
};

export enum TaskLifeCycle {
  "task_start" = "task_start",
  "task_finish" = "task_finish",
  "check_pass" = "check_pass",
  "check_fail" = "check_fail",
}

export type TaskOptions = {
  name: string;
  commands: CommandBase[];
  times?: number;
  preDelay?: number;
  postDelay?: number;
  next?: string[];
  checker?: CommandChecker;
};

export type CommandSchemaOptions = {
  checker?: { name: string; args?: string[] };
  preDelay?: number;
  postDelay?: number;
};

export interface TapCommandSchema extends CommandSchemaOptions {
  type: "tap";
  rect: Rect2;
}

export interface SwipeCommandSchema extends CommandSchemaOptions {
  type: "swipe";
  originRect: Rect2;
  targetRect: Rect2;
  duration?: number;
}

export interface KeyeventCommandSchema extends CommandSchemaOptions {
  type: "keyevent";
  keycode: number;
}

export interface TextCommandSchema extends CommandSchemaOptions {
  type: "text";
  content: string;
}
