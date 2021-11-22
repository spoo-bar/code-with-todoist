import * as vscode from 'vscode';
import path = require('path');
import fileSystemHelper from '../helpers/fileSystemHelper';

export class todosProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

    private projectId: Number;
    private extContext: vscode.Memento;

    constructor(context: vscode.Memento, projectId: Number) {
        this.projectId = projectId;
        this.extContext = context;
        this.getTodos();
    }

    onDidChangeTreeData?: vscode.Event<vscode.TreeItem | null | undefined> | undefined;

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: vscode.TreeItem | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
        return Promise.resolve(new Promise(function (resolve, reject) {
            return element
        }))
    }

    getTodos() {

    }
}