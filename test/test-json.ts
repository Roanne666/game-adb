import { createAdb, createTaskFlowFromJson, TapCommand, Task, TaskFlow } from "..";

(async () => {
  const adb = await createAdb("C:\\leidian\\LDPlayer9");

  const device = adb.devices.find((d) => d.serialNumber === "emulator-5554");

  if (device) {
    const taskFlow = createTaskFlowFromJson("./test/task.json", device);
    console.log(taskFlow)
  }
})();
