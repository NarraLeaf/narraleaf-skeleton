import chalk from "chalk";
import {confirm as promptConfirm, input as promptInput, select as promptSelect} from "@inquirer/prompts";

class LoadingTask {
    static Frames = {
        0: ["-", "\\", "|", "/"],
    }

    text: string | undefined;
    frame: keyof typeof LoadingTask.Frames;
    _tick: number | undefined;
    _interval: NodeJS.Timeout | undefined;

    constructor(protected fallTask: FallTask, frame: keyof typeof LoadingTask.Frames = 0) {
        this.frame = frame;
    }

    start(str: string) {
        this.text = str;
        this._interval = setInterval(() => this.tick(), 100);
        return this;
    }

    clearLine(str?: string) {
        const clearLine = '\r' + ' '.repeat(process.stdout.columns);
        if (str && str.length) process.stdout.write(`${clearLine}\r${this.fallTask.getEndPrefix()} ${str}`);
        else process.stdout.write(`${clearLine}\r`);
    }

    end(str?: string) {
        if (this._interval) clearInterval(this._interval);
        this.clearLine(str);
    }

    tick() {
        if (this._tick === undefined) this._tick = 0;
        else this._tick++;
        let output = [this.getAnimation(this._tick), this.text].join(" ");
        this.clearLine(output);
        return this;
    }

    setText(str: string) {
        this.text = str;
        return this;
    }

    getAnimation(tick: number) {
        const frames = LoadingTask.Frames[this.frame];
        return frames[tick % frames.length];
    }
}

class ProgressTask extends LoadingTask {
    static MaxLength = 120;
    static ProgressBarFrames = {
        0: {
            active: chalk.bgWhite(" "),
            inactive: chalk.bgGray(" ")
        }
    }

    maxTask: number;
    currentTask: number;
    pFrame: keyof typeof ProgressTask.ProgressBarFrames;

    constructor(
        protected fallTask: FallTask,
        frame: keyof typeof LoadingTask.Frames = 0,
        pFrame: keyof typeof ProgressTask.ProgressBarFrames = 0
    ) {
        super(fallTask, frame);

        this.maxTask = this.currentTask = 0;
        this.pFrame = pFrame;
    }

    setMaxTask(n: number) {
        this.maxTask = n;
        return this;
    }

    setCurrentTask(n: number) {
        this.currentTask = n;
        return this;
    }

    incrementTask() {
        this.currentTask++;
        return this;
    }

    tick() {
        if (this._tick === undefined) this._tick = 0;
        else this._tick++;

        const output = [`${this.fallTask.getEndPrefix()} ${this.getAnimation(this._tick)} │`, `│ (${this.currentTask}/${this.maxTask}) ${this.text}`];
        const prefixLength = output.reduce((acc, str) => acc + str.length, 0);

        process.stdout.write(`\r${output.join(this.getProgressBar(prefixLength))}`);
        return this;
    }

    getProgressBar(prefixLength: number) {
        let maxLength = (process.stdout.columns - prefixLength) > ProgressTask.MaxLength
            ? ProgressTask.MaxLength
            : process.stdout.columns - prefixLength;
        let progress = Math.floor((this.currentTask / this.maxTask) * maxLength);
        return (this.getPFrame(true)).repeat(progress) + (this.getPFrame(false)).repeat(maxLength - progress);
    }

    getPFrame(active: boolean) {
        return ProgressTask.ProgressBarFrames[this.pFrame][active ? "active" : "inactive"];
    }

    log(message: string) {
        this.clearLine(message);
        this.fallTask.step("");
        return this;
    }
}

export class FallTask {
    static LoadingTask = LoadingTask;

    static fall(tasks: string[]) {
        const fall = new FallTask();
        tasks.forEach((task, i) => {
            if (i === 0) fall.start(task);
            else if (i === tasks.length - 1) fall.end(task);
            else fall.step(task);
        });
    }

    start(str: string) {
        console.log(`${this.getHeaderPrefix()} ${str}`);
        return this;
    }

    step(str: string, steps = 0, space = 0): this {
        for (let i = 0; i < steps; i++) {
            console.log(`${this.getPrefix()}`);
        }
        let o = str.split("\n")
            .map((line) => line.length > process.stdout.columns - (this.getPrefix().length + 2)
                ? sliceString(line, process.stdout.columns - (this.getPrefix().length + 2))
                : line
            )
            .map((line) => " ".repeat(space) + line);
        o.forEach((line) => {
            console.log(`${this.getPrefix()} ${line}`);
        });
        return this;
    }

    waitForLoading<T>(
        handler: (resolve: (value: T) => void, reject: (message: string) => void, setText: (text: string) => void) => Promise<void> | void,
        str: string,
        frame: keyof typeof LoadingTask.Frames = 0
    ) {
        const loadingTask = new LoadingTask(this, frame);
        loadingTask.start(chalk.gray(str));
        return new Promise<T>((resolve, reject) => {
            handler(
                (value: T) => {
                    this.resetPrefix();
                    loadingTask.end("");
                    resolve(value);
                },
                (message: string) => {
                    this.resetPrefix();
                    loadingTask.end();
                    this.error(message);
                    reject(message);
                },
                (text: string) => loadingTask.setText(chalk.gray(text))
            );
        });
    }

    waitForProgress<T>(
        str: string,
        maxTask: number,
        handler: (resolve: (value: T) => void, reject: (message: string) => void, progress: ProgressTask) => Promise<void> | void,
        frame: keyof typeof LoadingTask.Frames = 0,
        pFrame: keyof typeof ProgressTask.ProgressBarFrames = 0
    ) {
        const progressTask = new ProgressTask(this, frame, pFrame);
        progressTask.start(chalk.gray(str)).setMaxTask(maxTask);
        return new Promise<T>((resolve, reject) => {
            handler(
                (value: T) => {
                    progressTask.end("\n");
                    resolve(value);
                },
                (message: string) => {
                    progressTask.end();
                    this.error(message);
                    reject(message);
                },
                progressTask
            );
        });
    }

    end(str: string) {
        this.resetPrefix();
        console.log(`${this.getEndPrefix()} ${str}`);
        return this;
    }

    error(str: string) {
        str.split("\n").forEach((line) => {
            this.step(chalk.red(line));
        });
        return this;
    }

    getPrefix() {
        return chalk.gray("│ ");
    }

    getEndPrefix() {
        return chalk.gray("╰─");
    }

    getHeaderPrefix() {
        return chalk.gray("╭─");
    }

    async input(prompt: string): Promise<string> {
        const answer = await input(prompt, {
            prefix: this.getEndPrefix()
        });
        this.resetPrefix();
        return answer;
    }

    async confirm(prompt: string): Promise<boolean> {
        const answer = await confirm(prompt, {
            prefix: this.getEndPrefix(),
        });
        this.resetPrefix();
        return answer;
    }

    resetPrefix() {
        process.stdout.cursorTo(0);
        process.stdout.moveCursor(0, -1);
        process.stdout.write(`\r${this.getPrefix()}`);
        process.stdout.moveCursor(-this.getPrefix().length, 1);
    }
}


async function input(message: string, options: {
    default?: string;
    required?: boolean;
    prefix?: string;
}): Promise<string> {
    return promptInput({
        message,
        default: options.default,
        required: options.required,
        theme: {
            prefix: options.prefix
        }
    });
}

async function confirm(message: string, options: {
    default?: boolean;
    prefix?: string;
} = {}): Promise<boolean> {
    return promptConfirm({
        message,
        default: options.default,
        theme: {
            prefix: options.prefix
        }
    });
}

async function select(message: string, choices: string[], options: {
    default?: string;
    prefix?: string;
} = {}): Promise<string> {
    return promptSelect({
        message,
        choices,
        default: options.default,
        theme: {
            prefix: options.prefix
        }
    });
}

function sliceString(str: string, n: number): string[] {
    return Array.from({length: Math.ceil(str.length / n)}, (_, i) => str.slice(i * n, (i + 1) * n));
}

export function getArguments(): string[] {
    const args = [...process.argv];

    if (args.length > 2) {
        return args.slice(2);
    }
    return [];
}

