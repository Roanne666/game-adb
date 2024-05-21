import { readFileSync } from "fs";
import { type CommandBase, TapCommand, SwipeCommand } from "./command";
import type { Device } from "./device";
import type { Rect2, TaskOptions } from "./types";
import { delay } from "./utils";

export class Task {
  public readonly name: String;
  public readonly commands: CommandBase[] = [];
  public readonly next: string[] = [];
  public readonly handler: () => Promise<boolean> | boolean = () => true;

  public readonly times: number = 1;
  public readonly preDelay: number = 500;
  public readonly postDelay: number = 500;

  constructor(options: TaskOptions) {
    this.name = options.name;
    this.commands.push(...options.commands);
    if (options.next) this.next.push(...options.next);
    if (options.handler) this.handler = options.handler;
    if (options.times) this.times = options.times;
    if (options.preDelay) this.preDelay = options.preDelay;
    if (options.postDelay) this.postDelay = options.postDelay;
  }

  public async run(device: Device): Promise<boolean> {
    await delay(this.preDelay);

    let status = false;
    if (this.handler) status = await this.handler();

    if (status) {
      for (const command of this.commands) {
        await device.issueCommand(command);
      }
    }

    await delay(this.preDelay);
    return status;
  }
}

export class TaskFlow {
  private readonly device: Device;

  private _tasks: Task[] = [];
  public get tasks() {
    return [...this._tasks];
  }

  constructor(device: Device) {
    this.device = device;
  }

  public async addTask(task: Task) {
    this._tasks.push(task);
  }

  public async addTasks(tasks: Task[]) {
    this._tasks.push(...tasks);
  }

  public async run(taskName: string | undefined = undefined) {
    if (this.tasks.length === 0) return;

    // find current task
    let currentTask: Task | undefined = undefined;
    if (taskName) {
      currentTask = this.tasks.find((t) => t.name === taskName);
    } else {
      currentTask = this.tasks[0];
    }
    if (currentTask === undefined) return;

    for (let i = 0; i < currentTask.times; i++) {
      // run cunrrent task
      await currentTask.run(this.device);

      // run all next tasks
      for (const n of currentTask.next) {
        await this.run(n);
      }
    }
  }
}

export function createTaskFlowFromJson(jsonPath: string, device: Device) {
  const buffer = readFileSync(jsonPath);
  const data: {
    name: string;
    commands: {
      type: "tap" | "swipe" | "keyevent" | "text";
      rect?: Rect2;
      originRect?: Rect2;
      targetRect?: Rect2;
      duration?: number;
      keycode?: number;
      content?: string;
      preDelay?: number;
      postDelay?: number;
    }[];
    preDelay?: number;
    postDelay?: number;
    times?: number;
    next?: string[];
  }[] = JSON.parse(buffer.toString());

  const taskFlow = new TaskFlow(device);
  for (const taskData of data) {
    const commands: CommandBase[] = [];
    for (const c of taskData.commands) {
      const type = c["type"];
      if (type === "tap") {
        if (c.rect) {
          commands.push(new TapCommand(c.rect, { preDelay: c.preDelay, postDelay: c.postDelay }));
        }
      } else if (type === "swipe") {
        if (c.originRect && c.targetRect) {
          commands.push(new SwipeCommand(c.originRect, c.targetRect, c.duration, { preDelay: c.preDelay, postDelay: c.postDelay }));
        }
      } else if (type === "keyevent") {
      } else if (type === "text") {
      }
    }

    const newTask = new Task({
      name: taskData.name,
      commands,
      preDelay: taskData.preDelay,
      postDelay: taskData.postDelay,
      times: taskData.times,
      next: taskData.next,
    });
    taskFlow.addTask(newTask);
  }

  return taskFlow;
}
