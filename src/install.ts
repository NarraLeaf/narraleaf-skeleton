import {FallTask} from "./console";
import {spawn} from "child_process";

export function install(fall: FallTask, project: string): Promise<void> {
    return new Promise((resolve, reject) => {
        npmInstall(project, (data) => {
            process.stdout.write(data);
        }, (data) => {
            process.stdout.write(data);
        }).then(() => {
            resolve();
            fall.end("Dependencies installed");
        }).catch((error) => {
            reject(error);
            fall.end("Failed to install dependencies");
        });
    });
}

export function installWithManager(fall: FallTask, project: string, manager: string): Promise<void> {
    return new Promise((resolve, reject) => {
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
            process.stdout.write(data);
        }, (data) => {
            process.stdout.write(data);
        }).then(() => {
            resolve();
            fall.end("Dependencies installed");
        }).catch((error) => {
            reject(error);
            fall.end("Failed to install dependencies");
        });
    });
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