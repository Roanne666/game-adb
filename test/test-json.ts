import { createAdb, createTaskFlowFromJson } from "../src";

(async () => {
  const adb = await createAdb(process.argv[2]);

  const device = adb.devices.find((d) => d.serialNumber === "emulator-5554");

  if (device) {
    device.commandResolution = { x: 1280, y: 720 };
    
    const taskFlow = createTaskFlowFromJson("./test/task.json", device);
    taskFlow.run();
  }
})();
