import Adb, { createAdb } from "./adb";

(async () => {
  const adb = await createAdb("D:\\leidian\\remote\\bin\\adb.exe");

  const device = adb.devices.find((d) => d.serialNumber === "emulator-5554");

  if (device) {
    device.createConnection(
      (data) => {
        console.log("get data");
        console.log(data);
      },
      (err) => {
        console.log(err);
      }
    );
    console.time("tap");
    await device.tap({ x: 500, y: 500 });
    console.timeEnd("tap");
    await new Promise((res) => setTimeout(() => res(true), 1000));
    await device.swipe({ x: 400, y: 400 }, { x: 700, y: 400 });
  }
})();
