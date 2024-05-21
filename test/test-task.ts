import { createAdb, TaskFlow } from "..";
import { quickMakeTask, saveDataTask } from "./tasks";

(async () => {
  const adb = await createAdb(process.argv[2]);

  const device = adb.devices.find((d) => d.serialNumber === "emulator-5554");

  if (device) {
    const status = await device.isCurrentActivity("game.taptap.teamtapas.ysst", "com.qk.game.MainActivity");

    // Check current focus activity
    if (!status) return;

    const taskFlow = new TaskFlow(device);

    taskFlow.addTasks([quickMakeTask, saveDataTask]);

    await taskFlow.run();
  }
})();
