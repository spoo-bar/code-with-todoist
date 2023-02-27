import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import SettingsHelper from './settingsHelper';

export default class FileSystemHelper {

    public static getWorkspaceFiles(): string[] {
        let workspace = vscode.workspace.rootPath!;
        let ignoredFolders = [path.join(workspace, '.git')];
        let ignoredFiles: string[] = [];
        if (SettingsHelper.useGitIgnore()) {
            const gitIgnorePath = path.join(workspace, ".gitignore");
            if (fs.existsSync(gitIgnorePath)) {
                let fileContent = fs.readFileSync(gitIgnorePath, "utf-8");
                for (let line of fileContent.split('\n').filter(l => !l.startsWith('#') && l)) {
                    if (path.extname(line)) {
                        ignoredFiles.push(line);
                    }
                    else {
                        ignoredFolders.push(path.join(workspace, line));
                    }
                }
            }
        }
        let folders: string[] = FileSystemHelper.getAllFolders(workspace, [], ignoredFolders);
        let files: string[] = [];
        for (let folder of folders) {
            let filesInFolder: string[] = fs.readdirSync(folder).filter(file => fs.statSync(path.join(folder, file)).isFile());
            filesInFolder.forEach(file => {
                files.push(path.join(folder, file));
            });
        }
        return files;
    }

    public static readFile(filePath: string): string {
        return fs.readFileSync(filePath, "utf-8");;
    }

    private static getAllFolders(dir: string, folderList: string[], ignoredPaths: string[]) {

        let folders: string[] = [];

        for (let folder of fs.readdirSync(dir).map(d => path.join(dir, d))) {

            if (ignoredPaths.every(i => i !== folder)) {
                if (fs.statSync(folder).isDirectory()) {
                    folders.push(folder);
                }
            }

        }
        folders.forEach(folder => {
            folderList.push(folder);
            return FileSystemHelper.getAllFolders(folder, folderList, ignoredPaths);
        });
        return folderList;
    }

}
