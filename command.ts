import { Command, type Rect2, type Vector2 } from "./types";

function getRandomPosition(rect: Rect2): Vector2 {
  const targetX = rect.width ? rect.x + Math.floor((Math.random() * (rect.width + 1)) / 10) : rect.x;
  const targetY = rect.height ? rect.y + Math.floor((Math.random() * (rect.height + 1)) / 10) : rect.y;
  return { x: targetX, y: targetY };
}

export function tap(rect: Rect2, options?: { delay?: number; id?: string }): Command {
  const targetPos = getRandomPosition(rect);
  return {
    delay: options?.delay || 500,
    id: options?.id,
    type: "tap",
    args: ["input", "tap", String(targetPos.x), String(targetPos.y)],
  };
}

export function swipe(
  originRect: Rect2,
  targetRect: Rect2,
  duration: number = 300,
  options?: { delay?: number; id?: string }
): Command {
  const originPos = getRandomPosition(originRect);
  const targetPos = getRandomPosition(targetRect);
  return {
    delay: options?.delay || 500,
    id: options?.id,
    type: "swipe",
    args: [
      "input",
      "swipe",
      String(originPos.x),
      String(originPos.y),
      String(targetPos.x),
      String(targetPos.y),
      String(duration),
    ],
  };
}

export function keyEvent(keyCode: number, options?: { delay?: number; id?: string }): Command {
  return {
    delay: options?.delay || 500,
    id: options?.id,
    type: "keyevent",
    args: ["input", "keyevent", String(keyCode)],
  };
}

export function text(content: string, options?: { delay?: number; id?: string }): Command {
  return {
    delay: options?.delay || 500,
    id: options?.id,
    type: "text",
    args: ["input", "text", content],
  };
}
