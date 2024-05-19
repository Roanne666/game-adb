import { execFile } from "child_process";
import Device from "./Device";

export async function createAdb(adbPath: string) {
  const adb = new Adb(adbPath);
  await adb.initDevices();
  return adb;
}

export default class Adb {
  public adbPath: string;
  public devices: Device[] = [];

  constructor(adbPath: string) {
    this.adbPath = adbPath;
  }

  public async initDevices() {
    const devicesStdout = await this.issueCommand(["devices"]);
    const deviceInfoArray = devicesStdout.trim().split("\r\n");
    let regAttached = false;
    for (const info of deviceInfoArray) {
      if (regAttached) {
        const [serialNumber, connectStatus] = info.split("\t");
        const newDevice = new Device(this, serialNumber, connectStatus === "device" ? true : false);
        this.devices.push(newDevice);
      } else if (info === "List of devices attached") {
        regAttached = true;
      }
    }
  }

  public async issueCommand(commands: string[]): Promise<string> {
    if (this.adbPath === "") return "";
    const result = await new Promise<string>((resolve) => {
      execFile(this.adbPath, commands, (error, stdout, stderr) => {
        if (error) {
          throw error;
        }
        resolve(stderr === "" ? stdout : stderr);
      });
    });
    return result;
  }
}
