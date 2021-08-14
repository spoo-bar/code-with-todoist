import * as vscode from 'vscode';
import { todoist } from '../models/todoist';
import { sortBy } from './sortBy';

const todoistAPIToken = "todoistAPIToken";
const todoistData = "todoist";
const selectedTask = "todoistSelectedTask"

export default class settingsHelper {


    public static getTodoistAPIToken(): string | undefined {
        return vscode.workspace.getConfiguration().get<string>("code.todoist.api");
    }

    public static useGitIgnore(): boolean | undefined {
        return vscode.workspace.getConfiguration().get<boolean>("code.todoist.useGitIgnore");
    }

    public static showTodaysTasks(): boolean | undefined {
        return vscode.workspace.getConfiguration().get<boolean>("code.todoist.showTodaysTasks");
    }

    public static showTaskNotifications(): boolean | undefined {
        return vscode.workspace.getConfiguration().get<boolean>("code.todoist.showTaskNotifications");
    }

    public static getSyncInterval(): number {
        return vscode.workspace.getConfiguration().get<number>("code.todoist.syncInternval") ?? 600000;
    }

    public static getTaskSortBy(): sortBy {
        const value = vscode.workspace.getConfiguration().get<string>("code.todoist.sortBy");
        return value as sortBy;
    }

    public static getTodoistData(context: vscode.Memento): todoist {
        const data = context.get<string>(todoistData);
        if (data) {
            return JSON.parse(data);
        }
        return new todoist();
    }

    public static setTodoistData(context: vscode.Memento, data: todoist): void {
        context.update(todoistData, JSON.stringify(data));
        return;
    }

    public static getSelectedTask(context: vscode.Memento): Number {
        let taskId = context.get<string>(selectedTask);
        if(taskId) {
            return parseInt(taskId);
        }
        return 0;
    }

    public static setSelectedTask(context: vscode.Memento, taskId: Number): void {
        context.update(selectedTask, taskId);
        return;
    }

    public static setWorkspaceProject(context: vscode.Memento, workspaceName: string, projectId: Number) : void {
        context.update(workspaceName, projectId);
    }

    public static getWorkspaceProject(context: vscode.Memento, workspaceName: string) : number {
        let projectId = context.get<string>(workspaceName);
        if(projectId) {
            return parseInt(projectId);
        }
        return 0;
    } 
}