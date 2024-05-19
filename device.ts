import { spawn, type ChildProcessWithoutNullStreams } from "child_process";
import Adb from "./adb";
import { Vector2 } from "./types";

export default class Device {
  private readonly adb: Adb;
  public readonly serialNumber: string;
  private status: boolean;
  public connection: ChildProcessWithoutNullStreams | null = null;

  constructor(adb: Adb, serialNumber: string, connectStatus: boolean) {
    this.adb = adb;
    this.serialNumber = serialNumber;
    this.status = connectStatus;
  }

  public getStatus() {
    return this.status;
  }

  public createConnection(stdoutHandler: (data: any) => void, stderrHandler: (err: any) => void) {
    this.connection = spawn(this.adb.adbPath, ["-s", this.serialNumber, "shell"]);
    this.connection.stdout.on("data", stdoutHandler);
    this.connection.stderr.on("data", stderrHandler);
  }

  public destroyConnection() {
    if (this.connection) {
      this.connection.stdin.write("exit");
      this.connection = null;
    }
  }

  public async issueCommand(commands: string[]) {
    if (this.connection) {
      this.connection.stdin.write(commands.join(" "), (err) => {
        console.error(err);
      });
    } else {
      await this.adb.issueCommand(["-s", this.serialNumber, "shell", ...commands]);
    }
  }

  public async tap(position: Vector2) {
    await this.issueCommand(["input", "tap", String(position.x), String(position.y)]);
  }

  public async swipe(originPosition: Vector2, finalPosition: Vector2) {
    await this.issueCommand(["input", "swipe ", String(originPosition.x), String(originPosition.y), String(finalPosition.x), String(finalPosition.y)]);
  }

  public async press() {
    await this.issueCommand(["input", "press"]);
  }

  public async asyncroll(distance: Vector2) {
    await this.issueCommand(["input", "roll", String(distance.x), String(distance.y)]);
  }

  public async keyEvent(keyCode: number) {
    await this.issueCommand(["input", "keyevent", String(keyCode)]);
  }

  public async text(content: string) {
    await this.issueCommand(["input", "text", content]);
  }
}
