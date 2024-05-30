import { Adb } from "../src";

(async () => {
  const adb = new Adb(process.argv[2]);

  const devices = await adb.getDevices();

  const device = devices.find((d) => d.serialNumber === "emulator-5554");

  if (device) {
    const packageName = "game.taptap.teamtapas.ysst";
    const activityName = "com.qk.game.MainActivity";
    await device.startApp(packageName, activityName);
    await device.closeApp(packageName);

    await device.getScreencap();
  }
})();
