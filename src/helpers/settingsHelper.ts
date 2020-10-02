import * as vscode from 'vscode';
import { todoist } from '../models/todoist';

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

    public static getSyncInterval(): number {
        return vscode.workspace.getConfiguration().get<number>("code.todoist.syncInternval") ?? 600000;
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

}