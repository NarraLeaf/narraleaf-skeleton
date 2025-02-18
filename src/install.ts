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

function npmInstall(cwd: string, onStdout: (data: string) => void, onStderr: (data: string) => void): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = spawn("npm", ["install"], { cwd, shell: true });

        child.stdout.on("data", (data) => {
            onStdout(data.toString());
        });

        child.stderr.on("data", (data) => {
            onStderr(data.toString());
        });

        child.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`npm install failed with exit code ${code}`));
            }
        });

        child.on("error", (error) => {
            reject(error);
        });
    });
}
