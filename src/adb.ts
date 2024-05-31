import { Device } from "./device";
import { delay, issueCommand } from "./utils";

export class Adb {
  /**
   * The folder where adb.exe is located
   */
  public readonly path: string;

  constructor(adbPath: string) {
    this.path = adbPath;
  }

  public async getDevices(retry = 3) {
    const devices: Device[] = [];
    for (let i = 0; i < retry; i++) {
      const devicesStdout = await issueCommand({ adbPath: this.path, args: ["devices"] });
      const deviceInfoArray = devicesStdout.trim().split("\r\n");
      let devicesAttached = false;
      for (const info of deviceInfoArray) {
        if (devicesAttached) {
          const [serialNumber, connectStatus] = info.split("\t");
          const newDevice = new Device(this.path, serialNumber, connectStatus === "device");
          newDevice.deviceResolution = await newDevice.getResolution();
          devices.push(newDevice);
        } else if (info === "List of devices attached") {
          devicesAttached = true;
        }
      }

      if (devices.length > 0) return devices;

      if (i < retry - 1) await delay(3000);
    }
    return devices;
  }
}
