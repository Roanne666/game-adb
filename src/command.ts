import type { CommandOptions, Rect2, Vector2 } from "./types";
import { getRandomPosition } from "./utils";

export abstract class CommandBase {
  static commandCount = 0;

  public readonly id: string = `command-${CommandBase.commandCount++}`;
  public readonly preDelay: number = 500;
  public readonly postDelay: number = 500;

  constructor(options?: CommandOptions) {
    if (options?.preDelay) this.preDelay = options.preDelay;
    if (options?.postDelay) this.postDelay = options.postDelay;
  }

  public abstract getCommandArgs(): string[];
}

export class TapCommand extends CommandBase {
  public readonly targetPos: Vector2;

  constructor(rect: Rect2, options?: CommandOptions) {
    super(options);
    this.targetPos = getRandomPosition(rect);
  }

  public getCommandArgs() {
    return ["input", "tap", String(this.targetPos.x), String(this.targetPos.y)];
  }
}

export class SwipeCommand extends CommandBase {
  public readonly originPos: Vector2;
  public readonly targetPos: Vector2;
  public readonly duration: number;

  constructor(originRect: Rect2, targetRect: Rect2, duration = 500, options?: CommandOptions) {
    super(options);
    this.originPos = getRandomPosition(originRect);
    this.targetPos = getRandomPosition(targetRect);
    this.duration = duration;
  }

  public getCommandArgs() {
    return [
      "input",
      "swipe",
      String(this.originPos.x),
      String(this.originPos.y),
      String(this.targetPos.x),
      String(this.targetPos.y),
      String(this.duration),
    ];
  }
}

export class keyEventCommand extends CommandBase {
  public readonly keyCode: number;

  constructor(keyCode: number, options?: CommandOptions) {
    super(options);
    this.keyCode = keyCode;
  }

  public getCommandArgs(): string[] {
    return ["input", "keyevent", String(this.keyCode)];
  }
}

export class TextCommand extends CommandBase {
  public readonly content: string;

  constructor(content: string, options?: CommandOptions) {
    super(options);
    this.content = content;
  }

  public getCommandArgs(): string[] {
    return ["input", "text", this.content];
  }
}
