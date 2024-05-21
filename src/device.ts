import type { CommandBase } from "./command";
import type { Vector2 } from "./types";
import { delay, issueShellCommand } from "./utils";

/**
 * The Device instance is binding with specific serial number of adb device.
 *
 */
export class Device {
  /**
   * The folder where adb.exe is located
   */
  private readonly adbPath: string;

  /**
   * Adb creates a string to uniquely identify the device by its port number. Here's an example serial number: emulator-5554
   */
  public readonly serialNumber: string;

  public readonly resolution: Vector2 = { x: 0, y: 0 };

  private _commandResolution: Vector2 = { x: 1280, y: 720 };
  public get commandResolution() {
    return this._commandResolution;
  }
  public set commandResolution(value: Vector2) {
    this._commandResolution = value;
  }

  private get resolutionRatio(): Vector2 {
    return { x: this.resolution.x / this.commandResolution.x, y: this.resolution.y / this.commandResolution.y };
  }

  private _connected: boolean;
  /**
   * Determines whether the device is connected
   */
  public get connected() {
    return this._connected;
  }

  /**
   * The command will be automatically executed after using the addCommand function if autoRun is true.
   */
  public autoRun = true;

  private _running = false;
  /**
   * Determines whether the command is running
   */
  public get running() {
    return this._running;
  }

  private _commandQueue: CommandBase[] = [];
  /**
   * The command will be added to the commandQueue after using the addCommond function,.
   */
  public get commandQueue() {
    return [...this._commandQueue];
  }

  /**
   * Callback function for command_start trigger
   */
  private onCommandStart: ((command: CommandBase) => void) | null = null;

  /**
   * Callback function for command_finish trigger
   */
  private onCommandFinish: ((command: CommandBase) => void) | null = null;

  constructor(adbPath: string, serialNumber: string, connectStatus: boolean) {
    this.adbPath = adbPath;
    this.serialNumber = serialNumber;
    this._connected = connectStatus;
  }

  public async init() {
    const resolution = await this.getResolution();
    this.resolution.x = resolution.x;
    this.resolution.y = resolution.y;
  }

  /**
   * Issue command by text
   * @param commandText
   */
  public async issueCommandText(commandText: string) {
    this._running = true;
    const result = await issueShellCommand(this.adbPath, ["-s", this.serialNumber, "shell", commandText]);
    this._running = false;
    return result;
  }

  /**
   * Issue standard command
   * @param command
   */
  public async issueCommand(command: CommandBase) {
    this._running = true;
    if (this.onCommandStart) this.onCommandStart(command);

    await delay(command.preDelay);
    await issueShellCommand(this.adbPath, ["-s", this.serialNumber, "shell", ...command.getCommandArgs(this.resolutionRatio)]);
    await delay(command.postDelay);

    if (this.onCommandFinish) this.onCommandFinish(command);

    if (this._commandQueue.length > 0 && this.autoRun) {
      const nextCommand = this._commandQueue.shift() as CommandBase;
      this.issueCommand(nextCommand);
    } else {
      this._running = false;
    }
  }

  /**
   * Add command to command queue
   * @param command
   */
  public addCommand(command: CommandBase) {
    if (this.autoRun && !this.running) {
      this.issueCommand(command);
    } else {
      this._commandQueue.push(command);
    }
  }

  /**
   * Manually trigger the command, which only works when autoRun is false
   * @returns command execute status
   */
  public async nextCommand() {
    if (this.autoRun || this._running || this._commandQueue.length === 0) return false;
    const nextCommand = this._commandQueue.shift() as CommandBase;
    await this.issueCommand(nextCommand);
    return true;
  }

  /**
   * Add listener for command_start or command_finish
   * @param eventName
   * @param handler
   */
  public on(eventName: "command_start" | "command_finish" | "command_delay_finish", handler: (command: CommandBase) => void) {
    if (eventName === "command_start") {
      this.onCommandStart = handler;
    } else {
      this.onCommandFinish = handler;
    }
  }

  /**
   * Remove Listener for command_start or command_finish
   * @param eventName
   */
  public off(eventName: "command_start" | "command_finish") {
    if (eventName === "command_start") {
      this.onCommandStart = null;
    } else {
      this.onCommandFinish = null;
    }
  }

  public async getResolution(): Promise<Vector2> {
    const result = await issueShellCommand(this.adbPath, ["-s", this.serialNumber, "shell", "wm", "size"]);
    const [width, height] = result.split(":")[1].split("x");
    return { x: Number(width.trim()), y: Number(height.trim()) };
  }

  public async getCurrentActivity() {
    const result = await issueShellCommand(this.adbPath, ["-s", this.serialNumber, "shell", "dumpsys", "window"]);
    const resultLines = result.split("\r\n");
    for (const line of resultLines) {
      if (line.includes("mCurrentFocus")) {
        return line;
      }
    }
    return "";
  }
}
