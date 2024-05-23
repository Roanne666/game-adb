import { EventEmitter } from "events";
import type { CommandBase } from "./command";
import { CommandLifeCycle, type Vector2 } from "./types";
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

  private readonly _eventEmmiter = new EventEmitter();

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
    this._eventEmmiter.emit(CommandLifeCycle.command_start, command);
    await delay(command.preDelay);

    const status = await command.checker(this);
    if (status) {
      this._eventEmmiter.emit(CommandLifeCycle.check_pass, command);
    } else {
      this._commandQueue.length = 0;
      this._running = false;
      this._eventEmmiter.emit(CommandLifeCycle.check_fail, command);
      return;
    }

    await issueShellCommand(this.adbPath, [
      "-s",
      this.serialNumber,
      "shell",
      ...command.getCommandArgs(this.resolutionRatio),
    ]);
    await delay(command.postDelay);

    this._eventEmmiter.emit(CommandLifeCycle.command_finish, command);

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
