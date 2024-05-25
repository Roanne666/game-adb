import type { CommandChecker, CommandOptions, Rect2, Vector2 } from "./types";
import { getRandomPosition } from "./utils";

export abstract class CommandBase {
  static commandCount = 0;

  public readonly id: string = `command-${CommandBase.commandCount++}`;
  public readonly preDelay: number = 500;
  public readonly postDelay: number = 500;
  public readonly checker: CommandChecker = { handler: () => true };

  constructor(options?: CommandOptions) {
    if (options?.preDelay) this.preDelay = options.preDelay;
    if (options?.postDelay) this.postDelay = options.postDelay;
    if (options?.checker) this.checker = options.checker;
  }

  public abstract getCommandArgs(resolutionRatio: Vector2): string[];
}

export class TapCommand extends CommandBase {
  public readonly targetPos: Vector2;

  constructor(options: { rect: Rect2 } & CommandOptions) {
    super(options);
    this.targetPos = getRandomPosition(options.rect);
  }

  public getCommandArgs(resolutionRatio: Vector2) {
    return ["input", "tap", String(this.targetPos.x * resolutionRatio.x), String(this.targetPos.y * resolutionRatio.y)];
  }
}

export class SwipeCommand extends CommandBase {
  public readonly originPos: Vector2;
  public readonly targetPos: Vector2;
  public readonly duration: number;

  constructor(options: { originRect: Rect2; targetRect: Rect2; duration?: number } & CommandOptions) {
    super(options);
    this.originPos = getRandomPosition(options.originRect);
    this.targetPos = getRandomPosition(options.targetRect);
    this.duration = options.duration || 500;
  }

  public getCommandArgs(resolutionRatio: Vector2) {
    return [
      "input",
      "swipe",
      String(this.originPos.x * resolutionRatio.x),
      String(this.originPos.y * resolutionRatio.y),
      String(this.targetPos.x * resolutionRatio.x),
      String(this.targetPos.y * resolutionRatio.y),
      String(this.duration),
    ];
  }
}

export class keyEventCommand extends CommandBase {
  public readonly keyCode: number;

  constructor(options: { keyCode: number } & CommandOptions) {
    super(options);
    this.keyCode = options.keyCode;
  }

  public getCommandArgs(): string[] {
    return ["input", "keyevent", String(this.keyCode)];
  }
}

export class TextCommand extends CommandBase {
  public readonly content: string;

  constructor(options: { content: string } & CommandOptions) {
    super(options);
    this.content = options.content;
  }

  public getCommandArgs(): string[] {
    return ["input", "text", this.content];
  }
}
