import * as vscode from 'vscode';
import { TodoistTreeItem } from '../models/todoistTreeView';
import SettingsHelper from '../helpers/settingsHelper';
import * as path from 'path';
import { sortBy } from '../helpers/sortBy';
import type { Task, DueDate } from '@doist/todoist-api-typescript';

export class TodayTaskProvider implements vscode.TreeDataProvider<TodoistTreeItem> {

    private state: vscode.Memento;

    private _onDidChangeTreeData: vscode.EventEmitter<TodoistTreeItem | undefined> = new vscode.EventEmitter<TodoistTreeItem | undefined>();
    onDidChangeTreeData?: vscode.Event<TodoistTreeItem | null | undefined> | undefined = this._onDidChangeTreeData.event;

    refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
	}

    constructor(context: vscode.Memento) {
        this.state = context;
    }

    getTreeItem(element: TodoistTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren() {
        const data = SettingsHelper.getTodoistData(this.state);

        if (!data.tasks || data.tasks.length === 0) {
            return;
        }

        const todayTasks = data.tasks.filter(task => task.due && isToday(task.due));
        return formatTasks(todayTasks);        
    }
}

function isToday(date: DueDate) {
    let taskDate = new Date(date.date);
    let today = new Date();
    return taskDate.getUTCFullYear() === today.getUTCFullYear() 
    && taskDate.getUTCMonth() === today.getUTCMonth()
    && taskDate.getUTCDate() === today.getUTCDate();
}

function formatTasks(tasks: Task[]) {
    let activeTasks: TodoistTreeItem[] = [];
    tasks = sortTasks();
    tasks.forEach(t => {
        let treeview = new TodoistTreeItem(t.content);
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

    function sortTasks(): Task[] {
        const sortByValue = SettingsHelper.getTaskSortBy();
        switch (sortByValue) {
            case sortBy.Order:
                return tasks.sort((a, b) => a.order > b.order ? 1 : -1);
            case sortBy.Priority:
                return tasks.sort((a, b) => a.priority > b.priority ? -1 : 1);
            case sortBy.Alphabetical:
                return tasks.sort((a, b) => a.content > b.content ? 1 : -1);
            default:
                return tasks.sort((a, b) => a.order > b.order ? 1 : -1);
        }        
    }
}
