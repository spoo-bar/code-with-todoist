import * as vscode from 'vscode';
import task, { DueDate } from '../models/task';
import { todoistTreeView } from '../models/todoistTreeView';
import settingsHelper from '../helpers/settingsHelper';
import path = require('path');

export class todayTaskProvider implements vscode.TreeDataProvider<todoistTreeView> {

    private state: vscode.Memento;

    private _onDidChangeTreeData: vscode.EventEmitter<todoistTreeView | undefined> = new vscode.EventEmitter<todoistTreeView | undefined>();
    onDidChangeTreeData?: vscode.Event<todoistTreeView | null | undefined> | undefined = this._onDidChangeTreeData.event;

    refresh(): void {
		this._onDidChangeTreeData.fire();
	}

    constructor(context: vscode.Memento) {
        this.state = context;
    }

    getTreeItem(element: todoistTreeView): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: todoistTreeView | undefined): vscode.ProviderResult<todoistTreeView[]> {
        const data = settingsHelper.getTodoistData(this.state);

        return Promise.resolve(new Promise(function (resolve, reject) {
            if (data.tasks && data.tasks.length > 0) {
                let todayTasks: task[] = [];
                data.tasks.forEach(task => {
                    if(task.due && isToday(task.due)) {
                        todayTasks.push(task);
                    }

                });
                resolve(formatTasks(todayTasks));
            }
        }));
    }
}

function isToday(date: DueDate) : boolean {
    let taskDate = new Date(date.date);
    let today = new Date();
    return taskDate.getUTCFullYear() == today.getUTCFullYear() 
    && taskDate.getUTCMonth() == today.getUTCMonth()
    && taskDate.getUTCDate() == today.getUTCDate();
}

function formatTasks(tasks: task[]) {
    let activeTasks: todoistTreeView[] = [];
    tasks = tasks.sort((a, b) => a.priority < b.priority ? 1 : -1);
    tasks.forEach(t => {
        let treeview = new todoistTreeView(t.content);
        treeview.id = t.id.toString();
        treeview.tooltip = t.content;
        treeview.collapsibleState = vscode.TreeItemCollapsibleState.None;
        treeview.task = t;
        treeview.iconPath = path.join(__filename, '..', '..', '..', 'media', 'priority', t.priority.toString() + '.svg');
        treeview.contextValue = 'todoistTask';
        treeview.command = {
            command: 'todoist.openTask',
            title: 'Open task',
            arguments: [t.id],
            tooltip: 'Open task'
        };

        activeTasks.push(treeview);
    });
    return activeTasks;
}
