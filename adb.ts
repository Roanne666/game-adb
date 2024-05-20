import { Device } from "./device";
import { issueShellCommand } from "./utils";

export async function createAdb(adbPath: string) {
  const adb = new Adb(adbPath);
  await adb.initDevices();
  return adb;
}

export class Adb {
  /**
   * The folder where adb.exe is located
   */
  public readonly adbPath: string;

  private _devices: Device[] = [];
  /**
   * The list of devices
   */
  public get devices() {
    return [...this._devices];
  }

  constructor(adbPath: string) {
    this.adbPath = adbPath;
  }

  public async initDevices() {
    const devicesStdout = await issueShellCommand(this.adbPath, ["devices"]);
    const deviceInfoArray = devicesStdout.trim().split("\r\n");
    let regAttached = false;
    for (const info of deviceInfoArray) {
      if (regAttached) {
        const [serialNumber, connectStatus] = info.split("\t");
        const newDevice = new Device(this.adbPath, serialNumber, connectStatus === "device" ? true : false);
        this._devices.push(newDevice);
      } else if (info === "List of devices attached") {
        regAttached = true;
      }
    }
  }
}
