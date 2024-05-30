import { TapCommand, Device, Adb } from "../src";

const enterFirstAd = new TapCommand({
  rect: { x: 789, y: 225, width: 212, height: 75 },
  postDelay: 1000 * 40,
});
const enterSecondAd = new TapCommand({
  rect: { x: 793, y: 356, width: 212, height: 75 },
  postDelay: 1000 * 40,
});
const enterThirdAd = new TapCommand({
  rect: { x: 793, y: 489, width: 212, height: 75 },
  postDelay: 1000 * 40,
});
const exitAd = new TapCommand({ rect: { x: 1170, y: 33, width: 69, height: 28 } });
const reviceAward = new TapCommand({ rect: { x: 711, y: 415, width: 100, height: 100 } });
const finishCommand = new TapCommand({ rect: { x: 711, y: 415, width: 100, height: 100 } });

let adCount = 1;

async function runCommands(device: Device) {
  if (adCount <= 10) {
    await device.issueShellCommand(enterFirstAd);
  } else if (adCount <= 20) {
    await device.issueShellCommand(enterSecondAd);
  } else if (adCount <= 30) {
    await device.issueShellCommand(enterThirdAd);
  } else {
    return;
  }
  await device.issueShellCommand(exitAd);
  await device.issueShellCommand(reviceAward);
  await device.issueShellCommand(finishCommand);
}

(async () => {
  const adb = new Adb(process.argv[2]);

  const devices = await adb.getDevices();

  const device = devices.find((d) => d.serialNumber === "emulator-5554");

  if (device) {
    device.on("command_finish", (command) => {
      if (command.id === finishCommand.id) {
        console.log(`Ad finish - current count ${adCount}`);
        adCount++;
        runCommands(device);
      }
    });

    runCommands(device);
  }
})();
