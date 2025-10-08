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
import chalk from "chalk";
import fs from "fs/promises";
import path from "path";
import { FallTask, getArguments } from "./console";
import { installWithManager } from "./install";
import { copyDirWithRules, getFileTree, scanDirTree } from "./source";

type Presets = {
    [K in string]?: {
        extra?: {
            from: string;
            to: string;
        }[];
    };
};

async function skeleton(): Promise<{ dest: string, manager: string }> {
    const version = await readVersion();
    console.log(chalk.gray(`NarraLeaf-Skeleton v${version}`));

    const fall = new FallTask();
    fall.start("Creating skeleton");

    const argDest = getArguments()[0];
    const dest = path.isAbsolute(argDest) ? argDest : path.join(process.cwd(), argDest);

    const skeletonDir = path.join(__dirname, "../skeleton");
    const templateDir = path.join(skeletonDir, "skeleton-ts");
    const time = Date.now();

    fall.step(chalk.gray(`Skeleton path: ${templateDir}`))
        .step(chalk.gray(`Destination path: ${dest}`));

    const replaceRulesPath = path.join(skeletonDir, "replace-rules.json");
    let replaceRules = {};
    try {
        replaceRules = JSON.parse(await fs.readFile(replaceRulesPath, "utf-8"));
    } catch { }

    await copyDirWithRules(templateDir, dest, replaceRules);

    const presetPath = path.join(skeletonDir, "generator-presets.json");
    let presets: Presets = {};
    try {
        presets = JSON.parse(await fs.readFile(presetPath, "utf-8"));
    } catch { }
    const tailwind = presets["tailwindcss"] || presets["tailwind"];
    if (tailwind && Array.isArray(tailwind.extra)) {
        for (const item of tailwind.extra) {
            const from = path.join(skeletonDir, item.from);
            const to = path.join(dest, item.to);
            await fs.mkdir(path.dirname(to), { recursive: true });
            await fs.copyFile(from, to);
        }
    }
    const tree = await scanDirTree(dest);
    getFileTree(tree, []).split('\n').forEach(line => fall.step(line));

    const manager = await fall.select(
        "Choose a package manager",
        ["npm", "yarn", "pnpm", "bun"],
        "npm"
    );

    fall.end(`Created skeleton in ${chalk.blue(Date.now() - time)}ms`);
    return { dest, manager };
}

async function installDependencies(dest: string, manager: string) {
    const time = Date.now();
    const fall = new FallTask();
    fall.start("Installing dependencies");
    await installWithManager(fall, dest, manager);
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
    const { dest, manager } = await skeleton();
    await installDependencies(dest, manager);
}();
