import { createAdb } from "..";

(async () => {
  const adb = await createAdb(process.argv[2]);

  const device = adb.devices.find((d) => d.serialNumber === "emulator-5554");

  if (device) {
    // const packageName = "game.taptap.teamtapas.ysst";
    // const activityName = "com.qk.game.MainActivity";
    // await device.startApp(packageName, activityName);
    // await device.closeApp(packageName);
    
    // await device.getScreencap();
  }
})();
