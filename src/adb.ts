import { Device } from "./device";
import { issueCommand } from "./utils";

export class Adb {
  /**
   * The folder where adb.exe is located
   */
  public readonly path: string;

  constructor(adbPath: string) {
    this.path = adbPath;
  }

  public async getDevices(retry = 3) {
    if (retry === 0) throw "Adb get devices failed";
    const devicesStdout = await issueCommand({ adbPath: this.path, args: ["devices"] });
    const deviceInfoArray = devicesStdout.trim().split("\r\n");
    let devicesAttached = false;
    let devices: Device[] = [];
    for (const info of deviceInfoArray) {
      if (devicesAttached) {
        const [serialNumber, connectStatus] = info.split("\t");
        const newDevice = new Device(this.path, serialNumber, connectStatus === "device" ? true : false);
        newDevice.resolution = await newDevice.getResolution();
        devices.push(newDevice);
      } else if (info === "List of devices attached") {
        devicesAttached = true;
      }
    }
    if (devices.length === 0) {
      devices = await this.getDevices(retry - 1);
    }
    return devices;
  }
}
