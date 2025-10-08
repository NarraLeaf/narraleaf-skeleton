import chalk from "chalk";
import fs from "fs/promises";
import path from "path";

export type FileTree = {
    type: "file";
    name: string;
    srcName?: string;
} | {
    type: "dir";
    name: string;
    children: FileTree[];
};

/**
 * Recursively copy a directory, applying replace rules to file names.
 * @param {string} srcDir - Source directory
 * @param {string} destDir - Destination directory
 * @param {Record<string, string>} replaceRules - File name replace rules
 */
export async function copyDirWithRules(srcDir: string, destDir: string, replaceRules: Record<string, string> = {}) {
    await fs.mkdir(destDir, { recursive: true });
    const entries = await fs.readdir(srcDir, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(srcDir, entry.name);
        let destName = replaceRules[entry.name] || entry.name;
        const destPath = path.join(destDir, destName);
        if (entry.isDirectory()) {
            await copyDirWithRules(srcPath, destPath, replaceRules);
        } else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}

/**
 * Recursively scan a directory and return FileTree structure.
 * @param {string} dir - Directory to scan
 * @returns {Promise<FileTree[]>}
 */
export async function scanDirTree(dir: string): Promise<FileTree[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const result: FileTree[] = [];
    for (const entry of entries) {
        if (entry.name === 'node_modules') continue;
        if (entry.isDirectory()) {
            result.push({
                type: "dir",
                name: entry.name,
                children: await scanDirTree(path.join(dir, entry.name))
            });
        } else {
            result.push({
                type: "file",
                name: entry.name
            });
        }
    }
    return result;
}

export function getFileTree(fileTree: FileTree[], failedEntities: string[]): string {
    const header = "NarraLeaf-Skeleton";
    const lines: string[] = [];

    const printTree = (tree: FileTree[], prefix: string = "") => {
        tree.forEach((file, index) => {
            const failed = failedEntities.includes(file.name);
            const isLast = index === tree.length - 1;
            const connector = isLast ? "╰─ " : "├─ ";
            lines.push(`${prefix}${connector}${failed ? chalk.bgRed(file.name) : file.name}`);

            if (file.type === "dir") {
                const newPrefix = prefix + (isLast ? "   " : "│  ");
                printTree(file.children, newPrefix);
            }
        });
    };

    printTree(fileTree, "");
    return `${header}\n${lines.join("\n")}`;
}

