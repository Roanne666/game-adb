import { createAdb, TapCommand, Device } from "../src";

(async () => {
  const adb = await createAdb(process.argv[2]);

  const device = adb.devices.find((d) => d.serialNumber === "emulator-5554");

  if (device) {
    let adCount = 1;
    const enterFirstAd = new TapCommand({ x: 789, y: 225, width: 212, height: 75 }, { postDelay: 1000 * 40 });
    const enterSecondAd = new TapCommand({ x: 793, y: 356, width: 212, height: 75 }, { postDelay: 1000 * 40 });
    const enterThirdAd = new TapCommand({ x: 793, y: 489, width: 212, height: 75 }, { postDelay: 1000 * 40 });

    const exitAd = new TapCommand({ x: 1170, y: 33, width: 69, height: 28 }, { postDelay: 1000 * 1 });
    const reviceAward = new TapCommand({ x: 711, y: 415, width: 100, height: 100 }, { postDelay: 1000 * 1 });
    const finishCommand = new TapCommand({ x: 711, y: 415, width: 100, height: 100 }, { postDelay: 1000 * 1 });

    addCommands(device);

    device.on("command_finish", (command) => {
      if (command.id === finishCommand.id) {
        console.log(`Ad finish - current count ${adCount}`);
        adCount++;
        addCommands(device);
      }
    });

    function addCommands(device: Device) {
      if (adCount <= 10) {
        device.addCommand(enterFirstAd);
      } else if (adCount <= 20) {
        device.addCommand(enterSecondAd);
      } else if (adCount <= 30) {
        device.addCommand(enterThirdAd);
      } else {
        return;
      }
      device.addCommand(exitAd);
      device.addCommand(reviceAward);
      device.addCommand(finishCommand);
    }
  }
})();
