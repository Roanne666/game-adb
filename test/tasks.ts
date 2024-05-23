import { Task, TapCommand, SwipeCommand, type Device } from "../src";

export const quickMakeTask = new Task({
  name: "quick_make",
  async checker(device: Device) {
    await device.getScreencap();
    return true;
  },
  commands: [
    // open popup
    new TapCommand({ rect: { x: 41, y: 640, width: 28, height: 25 } }),
    // open quick make
    new TapCommand({ rect: { x: 856, y: 94, width: 134, height: 29 } }),
    // swipe ap
    new SwipeCommand({ originRect: { x: 519, y: 361 }, targetRect: { x: 747, y: 368 } }),
    // confirm quick make
    new TapCommand({ rect: { x: 535, y: 496, width: 102, height: 31 }, postDelay: 1000 }),
    // confirm reward
    new TapCommand({ rect: { x: 535, y: 496, width: 102, height: 31 } }),
    new TapCommand({ rect: { x: 535, y: 496, width: 102, height: 31 }, postDelay: 1000 }),
    // close popup
    new TapCommand({ rect: { x: 1039, y: 87, width: 19, height: 30 } }),
  ],
  next: ["save_data"],
});

export const saveDataTask = new Task({
  name: "save_data",
  commands: [
    // open popup
    new TapCommand({ rect: { x: 1070, y: 12, width: 20, height: 25 } }),
    // click save
    new TapCommand({ rect: { x: 710, y: 262, width: 100, height: 39 } }),
    // confirm save
    new TapCommand({ rect: { x: 495, y: 420, width: 113, height: 28 } }),
    // close popup
    new TapCommand({ rect: { x: 958, y: 193, width: 18, height: 25 } }),
  ],
});
