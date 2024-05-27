import { EventEmitter } from "events";
import type { CommandBase, CommandLifeCycle } from "./command";
import { type Vector2 } from "./types";
import { delay, issueShellCommand } from "./utils";

export class DeviceEmitter<K extends string, T extends object = never> {
  private emitter = new EventEmitter();

  on(eventName: K, listener: (command: CommandBase) => void): void {
    this.emitter.on(eventName, listener);
  }

  off(eventName: K, listener: (command: CommandBase) => void): void {
    this.emitter.off(eventName, listener);
  }

  emit(eventName: K, arg?: T): void {
    this.emitter.emit(eventName, arg);
  }
}

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

  public resolution: Vector2 = { x: 0, y: 0 };

  public commandResolution: Vector2 = { x: 1280, y: 720 };

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

  private _running = false;
  /**
   * Determines whether the command is running
   */
  public get running() {
    return this._running;
  }

  private readonly _eventEmmiter = new DeviceEmitter<CommandLifeCycle, CommandBase>();

  constructor(adbPath: string, serialNumber: string, connectStatus: boolean) {
    this.adbPath = adbPath;
    this.serialNumber = serialNumber;
    this._connected = connectStatus;
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
   * Issue specified command
   * @param command
   */
  public async issueCommand(command: CommandBase): Promise<void> {
    this._running = true;
    this._eventEmmiter.emit("command_start", command);
    await delay(command.preDelay);

    await issueShellCommand(this.adbPath, [
      "-s",
      this.serialNumber,
      "shell",
      ...command.getCommandArgs(this.resolutionRatio),
    ]);
    await delay(command.postDelay);

    this._eventEmmiter.emit("command_finish", command);

    this._running = false;
  }

  /**
   * Issue specified commands
   * @param commands
   */
  public async issueCommands(commands: CommandBase[]): Promise<void> {
    this._running = true;
    for (const command of commands) {
      this._eventEmmiter.emit("command_start", command);
      await delay(command.preDelay);

      await issueShellCommand(this.adbPath, [
        "-s",
        this.serialNumber,
        "shell",
        ...command.getCommandArgs(this.resolutionRatio),
      ]);
      await delay(command.postDelay);

      this._eventEmmiter.emit("command_finish", command);
    }
    this._running = false;
  }

  /**
   * Add listener to command life cycle event
   * @param eventName
   * @param listener
   */
  public on(eventName: CommandLifeCycle, listener: (command: CommandBase) => void) {
    this._eventEmmiter.on(eventName, listener);
  }

  /**
   * Remove Listener to command life cycle event
   * @param eventName
   * @param listener
   */
  public off(eventName: CommandLifeCycle, listener: (command: CommandBase) => void) {
    this._eventEmmiter.off(eventName, listener);
  }

  /**
   * Get resolution of this device
   * @returns
   */
  public async getResolution(): Promise<Vector2> {
    const result = await issueShellCommand(this.adbPath, ["-s", this.serialNumber, "shell", "wm", "size"]);
    const [width, height] = result.split(":")[1].split("x");
    return { x: Number(width.trim()), y: Number(height.trim()) };
  }

  /**
   * Check if activity is running top
   * @param activityName
   * @returns
   */
  public async isCurrentActivity(packageName: string, activityName: string) {
    const result = await issueShellCommand(this.adbPath, ["-s", this.serialNumber, "shell", "dumpsys", "window"]);
    const resultLines = result.split("\r\n");
    for (const line of resultLines) {
      if (line.includes("mCurrentFocus") && line.includes(`${packageName}/${activityName}`)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Start an app if not at the current focus
   * @param pakageName
   * @param activityName
   */
  public async startApp(pakageName: string, activityName: string) {
    const status = await this.isCurrentActivity(pakageName, activityName);
    if (!status)
      await issueShellCommand(this.adbPath, [
        "-s",
        this.serialNumber,
        "shell",
        "am",
        "start",
        "-n",
        `${pakageName}/${activityName}`,
      ]);
  }

  /**
   * Close an app
   * @param pakageName
   */
  public async closeApp(pakageName: string) {
    await issueShellCommand(this.adbPath, ["-s", this.serialNumber, "shell", "am", "force-stop", pakageName]);
  }

  /**
   * Take a screencap and pull it out
   * @param options
   */
  public async getScreencap(options?: { fileName?: string; pullPath?: string }) {
    await issueShellCommand(this.adbPath, [
      "-s",
      this.serialNumber,
      "shell",
      "screencap",
      options?.fileName || "/sdcard/screen.png",
    ]);
    await issueShellCommand(this.adbPath, [
      "-s",
      this.serialNumber,
      "pull",
      options?.fileName || "/sdcard/screen.png",
      options?.pullPath || "./",
    ]);
  }
}
