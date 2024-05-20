import { Command } from "./types";
import { issueShellCommand } from "./utils";

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

  private _commandQueue: Command[] = [];
  /**
   * The command will be added to the commandQueue after using the addCommond function,.
   */
  public get commandQueue() {
    return [
      ...this._commandQueue.map<Command>((v) => {
        return this.getCommandCopy(v);
      }),
    ];
  }

  /**
   * Callback function for command_start trigger
   */
  private commandStartHandler: ((command: Command) => void) | null = null;

  /**
   * Callback function for command_finish trigger
   */
  private commandFinishHandler: ((command: Command) => void) | null = null;

  constructor(adbPath: string, serialNumber: string, connectStatus: boolean) {
    this.adbPath = adbPath;
    this.serialNumber = serialNumber;
    this._connected = connectStatus;
  }

  private getCommandCopy(command: Command): Command {
    return { delay: command.delay, id: command.id, type: command.type, args: [...command.args] };
  }

  public async issueCommand(command: Command) {
    this._running = true;
    if (this.commandStartHandler) this.commandStartHandler(this.getCommandCopy(command));

    await issueShellCommand(this.adbPath, ["-s", this.serialNumber, "shell", ...command.args]);
    await new Promise((resolve) => setTimeout(() => resolve(true), command.delay));

    if (this.commandFinishHandler) this.commandFinishHandler(this.getCommandCopy(command));

    if (this._commandQueue.length > 0 && this.autoRun) {
      const nextCommand = this._commandQueue.shift() as Command;
      this.issueCommand(nextCommand);
    } else {
      this._running = false;
    }
  }

  /**
   * Add command to command queue
   * @param command
   */
  public addCommand(command: Command) {
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
    const nextCommand = this._commandQueue.shift() as Command;
    await this.issueCommand(nextCommand);
    return true;
  }

  /**
   * Add listener for command_start or command_finish
   * @param eventName
   * @param handler
   */
  public on(
    eventName: "command_start" | "command_finish" | "command_delay_finish",
    handler: (command: Command) => void
  ) {
    if (eventName === "command_start") {
      this.commandStartHandler = handler;
    } else {
      this.commandFinishHandler = handler;
    }
  }

  /**
   * Remove Listener for command_start or command_finish
   * @param eventName
   */
  public off(eventName: "command_start" | "command_finish") {
    if (eventName === "command_start") {
      this.commandStartHandler = null;
    } else {
      this.commandFinishHandler = null;
    }
  }
}
