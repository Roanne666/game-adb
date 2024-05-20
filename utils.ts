import { execFile } from "child_process";

export async function issueShellCommand(adbPath: string, args: string[]) {
  const result = await new Promise<string>((resolve) => {
    execFile("adb", args, { cwd: adbPath }, (error, stdout, stderr) => {
      if (error) throw error;
      resolve(stderr === "" ? stdout : stderr);
    });
  });
  return result;
}
