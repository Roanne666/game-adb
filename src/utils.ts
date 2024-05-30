import { execFile } from "child_process";
import type { Rect2, Vector2 } from "./types";

export type IssueOptions = {
  adbPath: string;
  serialNumber?: string;
  isShellCommand?: boolean;
  args: string[];
};

export async function issueCommand(issueOptions: IssueOptions) {
  const result = await new Promise<string>((resolve) => {
    execFile(issueOptions.adbPath, handleArgs(issueOptions), (error, stdout, stderr) => {
      if (error) throw error;
      resolve(stderr === "" ? stdout : stderr);
    });
  });
  return result;
}

function handleArgs(issueOptions: IssueOptions) {
  const finalArgs: string[] = [];
  if (issueOptions.serialNumber) {
    finalArgs.push("-s", issueOptions.serialNumber);
  }

  if (issueOptions.isShellCommand) {
    finalArgs.push("shell");
  }

  finalArgs.push(...issueOptions.args);

  return finalArgs;
}

export function getRandomPosition(rect: Rect2): Vector2 {
  const targetX = rect.width ? rect.x + Math.floor((Math.random() * (rect.width + 1)) / 10) : rect.x;
  const targetY = rect.height ? rect.y + Math.floor((Math.random() * (rect.height + 1)) / 10) : rect.y;
  return { x: targetX, y: targetY };
}

export async function delay(time: number) {
  await new Promise((resolve) => setTimeout(() => resolve(true), time));
}
