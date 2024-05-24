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

  /**
   * The list of devices
   */
  public devices: Device[] = [];

  constructor(adbPath: string) {
    this.path = adbPath;
  }

  public async initDevices(retry = 3) {
    if (retry === 0) throw "Adb get devices failed";
    const devicesStdout = await issueShellCommand(this.path, ["devices"]);
    const deviceInfoArray = devicesStdout.trim().split("\r\n");
    let devicesAttached = false;
    for (const info of deviceInfoArray) {
      if (devicesAttached) {
        const [serialNumber, connectStatus] = info.split("\t");
        const newDevice = new Device(this.path, serialNumber, connectStatus === "device" ? true : false);
        newDevice.resolution = await newDevice.getResolution();
        this.devices.push(newDevice);
      } else if (info === "List of devices attached") {
        devicesAttached = true;
      }
    }
    if (this.devices.length === 0) {
      await this.initDevices(retry - 1);
    }
  }
}
