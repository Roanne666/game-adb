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
  public readonly path: string;

  private _devices: Device[] = [];
  /**
   * The list of devices
   */
  public get devices() {
    return [...this._devices];
  }

  constructor(adbPath: string) {
    this.path = adbPath;
  }

  public async initDevices(retry = 3) {
    if (retry === 0) throw "Adb get devices failed";
    const devicesStdout = await issueShellCommand(this.path, ["devices"]);
    const deviceInfoArray = devicesStdout.trim().split("\r\n");
    let regAttached = false;
    for (const info of deviceInfoArray) {
      if (regAttached) {
        const [serialNumber, connectStatus] = info.split("\t");
        const newDevice = new Device(this.path, serialNumber, connectStatus === "device" ? true : false);
        await newDevice.init();
        this._devices.push(newDevice);
      } else if (info === "List of devices attached") {
        regAttached = true;
      }
    }
    if (this.devices.length === 0) {
      await this.initDevices(retry - 1);
    }
  }
}
