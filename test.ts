import { createAdb } from "./adb";
import { tap } from "./command";

(async () => {
  const adb = await createAdb("C:\\leidian\\LDPlayer9");

  const device = adb.devices.find((d) => d.serialNumber === "emulator-5554");

  if (device) {
    let adCount = 12;
    device.on("command_finish", (command) => {
      if (command.id && command.id === "lastCommand") {
        console.log(`flow finish - current count ${adCount}`);
        adCount++;
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
    });

    const enterFirstAd = tap({ x: 789, y: 225, width: 212, height: 75 }, { delay: 1000 * 30 });
    const enterSecondAd = tap({ x: 793, y: 356, width: 212, height: 75 }, { delay: 1000 * 30 });
    const enterThirdAd = tap({ x: 793, y: 489, width: 212, height: 75 }, { delay: 1000 * 30 });

    const exitAd = tap({ x: 1170, y: 33, width: 69, height: 28 }, { delay: 1000 * 2 });
    const reviceAward = tap({ x: 711, y: 415, width: 100, height: 100 }, { delay: 1000 * 2 });
    const finishCommand = tap({ x: 711, y: 415, width: 100, height: 100 }, { delay: 1000 * 2, id: "lastCommand" });

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
})();
