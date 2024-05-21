import { createAdb, TapCommand, Task, TaskFlow } from "..";

(async () => {
  const adb = await createAdb("C:\\leidian\\LDPlayer9");

  const device = adb.devices.find((d) => d.serialNumber === "emulator-5554");

  if (device) {
    const result = await device.getCurrentActivity();

    // Check current focus activity
    if (!result.includes("game.taptap.teamtapas.ysst/com.qk.game.MainActivity")) return;

    const taskFlow = new TaskFlow(device);

    taskFlow.addTasks([
      new Task({
        name: "quick_make",
        commands: [
          // open popup
          new TapCommand({ x: 41, y: 640, width: 28, height: 25 }),
          // click quick make
          new TapCommand({ x: 856, y: 94, width: 134, height: 29 }),
          // confirm quick make
          new TapCommand({ x: 535, y: 496, width: 102, height: 31 }, { postDelay: 5000 }),
          // confirm reward
          new TapCommand({ x: 535, y: 496, width: 102, height: 31 }),
          // close popup
          new TapCommand({ x: 1039, y: 87, width: 19, height: 30 }),
        ],
        next: "save_data",
      }),
      new Task({
        name: "save_data",
        commands: [
          // open popup
          new TapCommand({ x: 1070, y: 12, width: 20, height: 25 }),
          // click save
          new TapCommand({ x: 710, y: 262, width: 100, height: 39 }),
          // confirm save
          new TapCommand({ x: 495, y: 420, width: 113, height: 28 }),
          // close popup
          new TapCommand({ x: 958, y: 193, width: 18, height: 25 }),
        ],
      }),
    ]);

    await taskFlow.run();
  }
})();
