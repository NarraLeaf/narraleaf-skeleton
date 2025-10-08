import {FallTask} from "./console";
import {spawn} from "child_process";

export function install(fall: FallTask, project: string): Promise<void> {
    return fall.waitForLoading((resolve, reject) => {
        npmInstall(project, (data) => {
            fall.resetPrefix();
            fall.step(data, 1);
        }, (data) => {
            fall.resetPrefix();
            fall.step(data, 1);
        }).then(() => {
            resolve();
            fall.end("Dependencies installed");
        }).catch((error) => {
            reject(error);
            fall.end("Failed to install dependencies");
        });
    }, "Installing dependencies");
}

export function installWithManager(fall: FallTask, project: string, manager: string): Promise<void> {
    return fall.waitForLoading((resolve, reject) => {
        let fn: typeof npmInstall;
        switch (manager) {
            case "yarn":
                fn = yarnInstall;
                break;
            case "pnpm":
                fn = pnpmInstall;
                break;
            case "bun":
                fn = bunInstall;
                break;
            case "npm":
            default:
                fn = npmInstall;
        }
        fn(project, (data) => {
            fall.resetPrefix();
            process.stdout.write(data);
        }, (data) => {
            fall.resetPrefix();
            process.stdout.write(data);
        }).then(() => {
            resolve();
            fall.end("Dependencies installed");
        }).catch((error) => {
            reject(error);
            fall.end("Failed to install dependencies");
        });
    }, `Installing dependencies with ${manager}`);
}

function npmInstall(cwd: string, onStdout: (data: string) => void, onStderr: (data: string) => void): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = spawn("npm", ["install"], { cwd, shell: true });
        child.stdout.on("data", (data) => onStdout(data.toString()));
        child.stderr.on("data", (data) => onStderr(data.toString()));
        child.on("close", (code) => code === 0 ? resolve() : reject(new Error(`npm install failed with exit code ${code}`)));
        child.on("error", (error) => reject(error));
    });
}

function yarnInstall(cwd: string, onStdout: (data: string) => void, onStderr: (data: string) => void): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = spawn("yarn", [], { cwd, shell: true });
        child.stdout.on("data", (data) => onStdout(data.toString()));
        child.stderr.on("data", (data) => onStderr(data.toString()));
        child.on("close", (code) => code === 0 ? resolve() : reject(new Error(`yarn install failed with exit code ${code}`)));
        child.on("error", (error) => reject(error));
    });
}

function pnpmInstall(cwd: string, onStdout: (data: string) => void, onStderr: (data: string) => void): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = spawn("pnpm", ["install"], { cwd, shell: true });
        child.stdout.on("data", (data) => onStdout(data.toString()));
        child.stderr.on("data", (data) => onStderr(data.toString()));
        child.on("close", (code) => code === 0 ? resolve() : reject(new Error(`pnpm install failed with exit code ${code}`)));
        child.on("error", (error) => reject(error));
    });
}

function bunInstall(cwd: string, onStdout: (data: string) => void, onStderr: (data: string) => void): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = spawn("bun", ["install"], { cwd, shell: true });
        child.stdout.on("data", (data) => onStdout(data.toString()));
        child.stderr.on("data", (data) => onStderr(data.toString()));
        child.on("close", (code) => code === 0 ? resolve() : reject(new Error(`bun install failed with exit code ${code}`)));
        child.on("error", (error) => reject(error));
    });
}