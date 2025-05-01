import fs from "fs/promises";
import path from "path";
import {FallTask} from "./console";
import chalk from "chalk";

/**
 * NarraLeaf-Skeleton
 * ├── package-js.json
 * ├── narraleaf.config.js
 * ├── README.md
 * ├── .gitignore
 * ├── (tsconfig.json)
 * ├── /main/
 * ├── ├── /assets/
 * ├── │   └── app-icon.ico
 * │   └── index.(ts|js)
 * └── /renderer/
 *     ├── app.(tsx|jsx)
 *     ├── /src/
 *     │   ├── story.(ts|js)
 *     │   └── base.css
 *     ├── /public/
 *     │   └── placeholder.png
 *     └── /pages/
 *         └── home.(tsx|jsx)
 */

export type FileTree = {
    type: "file";
    name: string;
    srcName?: string;
} | {
    type: "dir";
    name: string;
    children: FileTree[];
};

export const JavaScriptFiles: FileTree[] = [
    {
        type: "file",
        name: "package-js.json",
        srcName: "package-js.json"
    },
    {
        type: "file",
        name: "narraleaf.config.js",
        srcName: "narraleaf.config-js.js"
    },
    {
        type: "file",
        name: "README.md"
    },
    {
        type: "file",
        name: ".gitignore",
        srcName: "gitignore.txt"
    },
    {
        type: "dir",
        name: "main",
        children: [
            {
                type: "dir",
                name: "assets",
                children: [
                    {
                        type: "file",
                        name: "app-icon.ico"
                    }
                ]
            },
            {
                type: "file",
                name: "index.js"
            }
        ]
    },
    {
        type: "dir",
        name: "renderer",
        children: [
            {
                type: "file",
                name: "app.jsx"
            },
            {
                type: "dir",
                name: "src",
                children: [
                    {
                        type: "file",
                        name: "base.css"
                    },
                    {
                        type: "file",
                        name: "story.js"
                    }
                ]
            },
            {
                type: "dir",
                name: "public",
                children: [
                    {
                        type: "file",
                        name: "placeholder.png"
                    }
                ]
            },
            {
                type: "dir",
                name: "pages",
                children: [
                    {
                        type: "file",
                        name: "home.jsx"
                    },
                ]
            }
        ]
    }
];

export const TypeScriptFiles: FileTree[] = [
    {
        type: "file",
        name: "package.json",
        srcName: "package-ts.json"
    },
    {
        type: "file",
        name: "narraleaf.config.js",
        srcName: "narraleaf.config-ts.js"
    },
    {
        type: "file",
        name: "README.md"
    },
    {
        type: "file",
        name: ".gitignore",
        srcName: "gitignore.txt"
    },
    {
        type: "file",
        name: "tsconfig.json"
    },
    {
        type: "dir",
        name: "main",
        children: [
            {
                type: "dir",
                name: "assets",
                children: [
                    {
                        type: "file",
                        name: "app-icon.ico"
                    }
                ]
            },
            {
                type: "file",
                name: "index.ts"
            }
        ]
    },
    {
        type: "dir",
        name: "renderer",
        children: [
            {
                type: "file",
                name: "app.tsx"
            },
            {
                type: "dir",
                name: "src",
                children: [
                    {
                        type: "file",
                        name: "base.css"
                    },
                    {
                        type: "file",
                        name: "story.ts"
                    }
                ]
            },
            {
                type: "dir",
                name: "public",
                children: [
                    {
                        type: "file",
                        name: "placeholder.png"
                    }
                ]
            },
            {
                type: "dir",
                name: "pages",
                children: [
                    {
                        type: "file",
                        name: "home.tsx"
                    },
                ]
            }
        ]
    }
];

export const TailwindCSSFiles: FileTree[] = [
    {
        type: "file",
        name: "tailwind.config.js"
    },
    {
        type: "file",
        name: "postcss.config.js"
    },
    {
        type: "dir",
        name: "renderer",
        children: [
            {
                type: "dir",
                name: "src",
                children: [
                    {
                        type: "file",
                        name: "base.css",
                        srcName: "base-tailwind.css"
                    }
                ]
            }
        ]
    }
];

function mergeFileTrees(mainTree: FileTree[], extraTree: FileTree[]): FileTree[] {
    const result = [...mainTree];
    
    for (const extra of extraTree) {
        const existingIndex = result.findIndex(item => item.name === extra.name);
        
        if (existingIndex === -1) {
            result.push(extra);
        } else if (extra.type === "file") {
            // Overwrite file
            result[existingIndex] = extra;
        } else if (extra.type === "dir" && result[existingIndex].type === "dir") {
            // Merge directory contents
            result[existingIndex] = {
                type: "dir",
                name: extra.name,
                children: mergeFileTrees(result[existingIndex].children, extra.children)
            };
        }
    }
    
    return result;
}

function copySkeleton(
    {
        src,
        dest,
        files
    }: {
        src: string,
        dest: string,
        files: FileTree[]
    },
    onResolve: (path: string) => void,
    onReject: (error: unknown, path: string) => void
): Promise<void> {
    const copyFile = async (src: string, dest: string) => {
        try {
            await fs.copyFile(src, dest);
            onResolve(dest);
        } catch (error) {
            onReject(error, dest);
        }
    };

    const mkDir = async (dest: string) => {
        try {
            await fs.mkdir(dest, {recursive: true});
            onResolve(dest);
        } catch (error) {
            onReject(error, dest);
        }
    };

    const copyFiles = async (files: FileTree[], src: string, dest: string) => {
        for (const file of files) {
            if (file.type === "file") {
                await copyFile(path.join(src, file.srcName || file.name), path.join(dest, file.name));
            } else if (file.type === "dir") {
                await mkDir(path.join(dest, file.name));
                await copyFiles(file.children, path.join(src, file.name), path.join(dest, file.name));
            }
        }
    };

    return copyFiles(files, src, dest);
}

function getFileTree(fileTree: FileTree[], failedEntities: string[]): string {
    const header = "NarraLeaf-Skeleton";
    const lines: string[] = [];

    const printTree = (tree: FileTree[], prefix: string = "") => {
        tree.forEach((file, index) => {
            const failed = failedEntities.includes(file.name);
            const isLast = index === tree.length - 1;
            const connector = isLast ? "└── " : "├── ";
            lines.push(`${prefix}${connector}${failed ? chalk.bgRed(file.name) : file.name}`);

            if (file.type === "dir") {
                const newPrefix = prefix + (isLast ? "    " : "│   ");
                printTree(file.children, newPrefix);
            }
        });
    };

    printTree(fileTree, "");
    return `${header}\n${lines.join("\n")}`;
}

export async function createSkeleton(
    fall: FallTask, 
    useTS: boolean, 
    src: string, 
    dest: string, 
    extraFiles: FileTree[] = []
) {
    await fall.waitForLoading<void>(async (resolve, _, setText) => {
        await fs.mkdir(dest, {recursive: true});

        const failedEntities: string[] = [];
        const mergedFiles = mergeFileTrees(useTS ? TypeScriptFiles : JavaScriptFiles, extraFiles);
        
        await copySkeleton({
            src,
            dest,
            files: mergedFiles
        }, (p) => {
            fall.step(chalk.gray(`Created ${path.relative(dest, p)}`));
            setText(`Created ${path.relative(dest, p)}`);
        }, (error, p) => {
            fall.step(chalk.red(`Error: ${error}`));
            failedEntities.push(path.basename(p));
        });

        fall.step(chalk.gray("Generating file tree..."))
            .step(getFileTree(mergedFiles, failedEntities));

        resolve();
    }, "copying files...");
}

