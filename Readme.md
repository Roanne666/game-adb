# game-adb

## Introduction
game-adb is an easy-to-use adb library for making automated game software

## Installation

```bash
// with npm
npm install game-adb

// with yarn
yarn add game-adb
```

## Usage

Create adb client and get device

```typescript
import { createAdb } from "game-adb";

(async () => {
  const adb = await createAdb(path/to/adb);
  const device = adb.devices.find((d) => d.serialNumber === "emulator-5554");
  if (device) {
    // code
  }
})()
```

Please view the contents of the "test" folder in packages for more usage instructions