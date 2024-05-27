import { execFile } from "child_process";
import type { Rect2, Vector2 } from "./types";

export async function issueCommand(adbPath: string, args: string[]) {
  const result = await new Promise<string>((resolve) => {
    execFile(adbPath, args, (error, stdout, stderr) => {
      if (error) throw error;
      resolve(stderr === "" ? stdout : stderr);
    });
  });
  return result;
}

export function getRandomPosition(rect: Rect2): Vector2 {
  const targetX = rect.width ? rect.x + Math.floor((Math.random() * (rect.width + 1)) / 10) : rect.x;
  const targetY = rect.height ? rect.y + Math.floor((Math.random() * (rect.height + 1)) / 10) : rect.y;
  return { x: targetX, y: targetY };
}

export async function delay(time: number) {
  await new Promise((resolve) => setTimeout(() => resolve(true), time));
}
