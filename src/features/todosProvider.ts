import * as vscode from 'vscode';
import path = require('path');
import fileSystemHelper from '../helpers/fileSystemHelper';

export class todosProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

    onDidChangeTreeData?: vscode.Event<vscode.TreeItem | null | undefined> | undefined;

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        element.label = element.label;
        return element;
    }
    getChildren(element?: vscode.TreeItem | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
        if (element) {
            return Promise.resolve(new Promise(function (resolve, reject) {
                if (element.resourceUri) {
                    let treeViewItem: vscode.TreeItem[] = [];
                    let data = fileSystemHelper.readFile(element.resourceUri.fsPath);
                    if (data) {
                        data.split("\n").forEach((line, i) => {
                            if (line.includes("TODO")) {
                                let label = line.replace('//', '').replace('#', '').replace(':','').replace('TODO', '').trim();
                                let treeitem = new vscode.TreeItem('· ' + label);
                                treeitem.contextValue = 'customTodo';
                                treeitem.tooltip = line;
                                treeitem.command = {
                                    command: 'todoist.openCustomTask',
                                    title: 'Open Todo',
                                    arguments: [element.resourceUri, i, line.length],
                                    tooltip: 'Open Todo'
                                };
                                treeViewItem.push(treeitem);
                            }
                        });
                        resolve(treeViewItem);
                    }
                }
            }));
        }
        else {
            return Promise.resolve(new Promise(function (resolve, reject) {
                let todoFiles: vscode.TreeItem[] = [];

                if (vscode.workspace.rootPath) {

                    let files = fileSystemHelper.getWorkspaceFiles();
                    let filesWithTodo: Set<string> = new Set();
                    for (let file of files) {
                        let data = fileSystemHelper.readFile(file);
                        if (data) {
                            data.split("\n").some(line => {
                                if (line.includes("TODO")) {
                                    filesWithTodo.add(file);
                                }
                            });
                        }
                    }
                    for (let file of Array.from(filesWithTodo)) {
                        let name = path.basename(file);
                        let treeItem = new vscode.TreeItem(name);
                        treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
                        treeItem.resourceUri = vscode.Uri.file(file);
                        treeItem.iconPath = vscode.ThemeIcon.File;
                        todoFiles.push(treeItem);
                    }
                    resolve(todoFiles);
                }

            }));
        }
    }



}