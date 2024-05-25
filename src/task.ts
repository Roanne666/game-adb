import { EventEmitter } from "events";
import { readFileSync } from "fs";
import { type CommandBase, TapCommand, SwipeCommand, keyEventCommand, TextCommand } from "./command";
import type { Device } from "./device";
import type {
  CommandChecker,
  KeyeventCommandSchema,
  SwipeCommandSchema,
  TapCommandSchema,
  TaskLifeCycle,
  TaskOptions,
  TextCommandSchema,
} from "./types";
import { delay } from "./utils";

export class Task {
  public readonly name: String;
  public readonly commands: CommandBase[] = [];
  public readonly next: string[] = [];
  public readonly checker: CommandChecker = { handler: () => true };

  public readonly times: number = 1;
  public readonly preDelay: number = 500;
  public readonly postDelay: number = 500;

  private readonly _eventEmitter = new EventEmitter();

  constructor(options: TaskOptions) {
    this.name = options.name;
    this.commands.push(...options.commands);
    if (options.next) this.next.push(...options.next);
    if (options.checker) this.checker = options.checker;
    if (options.times) this.times = options.times;
    if (options.preDelay) this.preDelay = options.preDelay;
    if (options.postDelay) this.postDelay = options.postDelay;
  }

  public async run(device: Device): Promise<boolean> {
    await delay(this.preDelay);

    let status = false;
    if (this.checker) status = await this.checker.handler(device);

    if (status) {
      for (const command of this.commands) {
        await device.issueCommand(command);
      }
    }

    await delay(this.postDelay);
    return status;
  }

  /**
   * Add listener to task life cycle event
   * @param eventName
   * @param listener
   */
  public on(eventName: TaskLifeCycle, listener: (command: CommandBase) => void) {
    this._eventEmitter.on(eventName, listener);
  }

  /**
   * Remove Listener to task life cycle event
   * @param eventName
   * @param listener
   */
  public off(eventName: TaskLifeCycle, listener: (command: CommandBase) => void) {
    this._eventEmitter.off(eventName, listener);
  }
}

export class TaskFlow {
  private readonly device: Device;

  public tasks: Task[] = [];

  constructor(device: Device) {
    this.device = device;
  }

  public addTask(task: Task) {
    this.tasks.push(task);
  }

  public removeTask(taskName: string) {
    const index = this.tasks.findIndex((t) => t.name === taskName);
    if (index > -1) this.tasks.splice(index, 1);
    return index > -1;
  }

  public addTasks(tasks: Task[]) {
    this.tasks.push(...tasks);
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
    commands: (TapCommandSchema | SwipeCommandSchema | KeyeventCommandSchema | TextCommandSchema)[];
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
        commands.push(new TapCommand({ rect: c.rect, preDelay: c.preDelay, postDelay: c.postDelay }));
      } else if (type === "swipe") {
        commands.push(
          new SwipeCommand({
            originRect: c.originRect,
            targetRect: c.targetRect,
            duration: c.duration,
            preDelay: c.preDelay,
            postDelay: c.postDelay,
          })
        );
      } else if (type === "keyevent") {
        commands.push(
          new keyEventCommand({
            keyCode: c.keycode,
            preDelay: c.preDelay,
            postDelay: c.postDelay,
          })
        );
      } else if (type === "text") {
        commands.push(
          new TextCommand({
            content: c.content,
            preDelay: c.preDelay,
            postDelay: c.postDelay,
          })
        );
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
