#!/usr/bin/env node

/**
 *       ___           ___           ___           ___           ___           ___       ___           ___           ___
 *      /\__\         /\  \         /\  \         /\  \         /\  \         /\__\     /\  \         /\  \         /\  \
 *     /::|  |       /::\  \       /::\  \       /::\  \       /::\  \       /:/  /    /::\  \       /::\  \       /::\  \
 *    /:|:|  |      /:/\:\  \     /:/\:\  \     /:/\:\  \     /:/\:\  \     /:/  /    /:/\:\  \     /:/\:\  \     /:/\:\  \
 *   /:/|:|  |__   /::\~\:\  \   /::\~\:\  \   /::\~\:\  \   /::\~\:\  \   /:/  /    /::\~\:\  \   /::\~\:\  \   /::\~\:\  \
 *  /:/ |:| /\__\ /:/\:\ \:\__\ /:/\:\ \:\__\ /:/\:\ \:\__\ /:/\:\ \:\__\ /:/__/    /:/\:\ \:\__\ /:/\:\ \:\__\ /:/\:\ \:\__\
 *  \/__|:|/:/  / \/__\:\/:/  / \/_|::\/:/  / \/_|::\/:/  / \/__\:\/:/  / \:\  \    \:\~\:\ \/__/ \/__\:\/:/  / \/__\:\ \/__/
 *      |:/:/  /       \::/  /     |:|::/  /     |:|::/  /       \::/  /   \:\  \    \:\ \:\__\        \::/  /       \:\__\
 *      |::/  /        /:/  /      |:|\/__/      |:|\/__/        /:/  /     \:\  \    \:\ \/__/        /:/  /         \/__/
 *      /:/  /        /:/  /       |:|  |        |:|  |         /:/  /       \:\__\    \:\__\         /:/  /
 *      \/__/         \/__/         \|__|         \|__|         \/__/         \/__/     \/__/         \/__/
 *
 * © 2025 Nomen (helloyork)
 * NarraLeaf-Skeleton
 * A suggested project structure for NarraLeaf engine
 *
 * @author: Nomen (helloyork) https://github.com/helloyork
 * @license: MIT
 */
import path from "path";
import {createSkeleton} from "./source";
import {FallTask, getArguments} from "./console";
import chalk from "chalk";
import {install} from "./install";
import fs from "fs/promises";

async function skeleton(): Promise<string> {
    const version = await readVersion();
    console.log(chalk.gray(`NarraLeaf-Skeleton v${version}`));

    const fall = new FallTask();
    fall.start("Creating skeleton");

    const useTypeScript = await fall.confirm("Use TypeScript?");
    const argDest = getArguments()[0];
    const dest = path.isAbsolute(argDest) ? argDest : path.join(process.cwd(), argDest);

    const skeletonPath = path.join(__dirname, "../skeleton");
    const time = Date.now();

    fall.step(chalk.gray(`Skeleton path: ${skeletonPath}`))
        .step(chalk.gray(`Destination path: ${dest}`))
        .step(chalk.gray(`Using ${useTypeScript ? "TypeScript" : "JavaScript"}`));

    await createSkeleton(fall, useTypeScript, skeletonPath, dest);
    fall.end(`Created skeleton in ${chalk.blue(Date.now() - time)}ms`);

    return dest;
}

async function installDependencies(dest: string) {
    const time = Date.now();
    const fall = new FallTask();
    fall.start("Installing dependencies");
    await install(fall, dest);

    console.log(`Project created at ${chalk.blue(dest)}`);
    console.log(chalk.green(`Created skeleton in ${chalk.blue(Date.now() - time)}ms`));
}

async function readVersion() {
    const packageJsonPath = path.join(__dirname, "../package.json");
    const packageJson = await fs.readFile(packageJsonPath, "utf-8");
    const version = JSON.parse(packageJson).version;
    return version;
}

!async function () {
    const dest = await skeleton();
    await installDependencies(dest);
}();
