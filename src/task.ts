import type { CommandBase } from "./command";
import type { Device } from "./device";
import type { TaskOptions } from "./types";
import { delay } from "./utils";

export class Task {
  public readonly name: String;
  public readonly commands: CommandBase[] = [];
  public readonly next: string | undefined = undefined;
  public readonly handler: () => Promise<boolean> | boolean = () => true;

  public readonly preDelay: number = 500;
  public readonly postDelay: number = 500;

  constructor(options: TaskOptions) {
    this.name = options.name;
    this.commands.push(...options.commands);
    if (options.next) this.next = options.next;
    if (options.handler) this.handler = options.handler;
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

    // run cunrrent task
    await currentTask.run(this.device);

    // run next task
    if (currentTask.next) await this.run(currentTask.next);
  }
}
