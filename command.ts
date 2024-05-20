import { Command, type Rect2, type Vector2 } from "./types";

function getRandomPosition(rect: Rect2): Vector2 {
  const targetX = rect.width ? rect.x + Math.floor((Math.random() * (rect.width + 1)) / 10) : rect.x;
  const targetY = rect.height ? rect.y + Math.floor((Math.random() * (rect.height + 1)) / 10) : rect.y;
  return { x: targetX, y: targetY };
}

let commandCount = 0;

export function tap(rect: Rect2, options?: { delay?: number; id?: string }): Command {
  commandCount++;
  const targetPos = getRandomPosition(rect);
  return {
    id: options?.id || `command-${commandCount}`,
    type: "tap",
    args: ["input", "tap", String(targetPos.x), String(targetPos.y)],
    delay: options?.delay || 500,
  };
}

export function swipe(originRect: Rect2, targetRect: Rect2, duration: number = 300, options?: { delay?: number; id?: string }): Command {
  commandCount++;
  const originPos = getRandomPosition(originRect);
  const targetPos = getRandomPosition(targetRect);
  return {
    id: options?.id || `command-${commandCount}`,
    type: "swipe",
    args: ["input", "swipe", String(originPos.x), String(originPos.y), String(targetPos.x), String(targetPos.y), String(duration)],
    delay: options?.delay || 500,
  };
}

export function keyEvent(keyCode: number, options?: { delay?: number; id?: string }): Command {
  commandCount++;
  return {
    id: options?.id || `command-${commandCount}`,
    type: "keyevent",
    args: ["input", "keyevent", String(keyCode)],
    delay: options?.delay || 500,
  };
}

export function text(content: string, options?: { delay?: number; id?: string }): Command {
  commandCount++;
  return {
    id: options?.id || `command-${commandCount}`,
    type: "text",
    args: ["input", "text", content],
    delay: options?.delay || 500,
  };
}
