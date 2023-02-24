import * as vscode from 'vscode';
import { TODOIST_INITIAL_STATE, TodoistState } from '../models/todoist';
import { sortBy } from './sortBy';

const todoistData = "todoist";
const selectedTask = "todoistSelectedTask";

export default class SettingsHelper {
    public static getTodoistAPIToken() {
        return vscode.workspace.getConfiguration().get<string>("apiToken");
    }

    public static getSyncInterval() {
        return vscode.workspace.getConfiguration().get<number>("syncInternval") ?? 600000;
    }

    public static getTaskSortBy() {
        const value = vscode.workspace.getConfiguration().get<sortBy>("taskDisplay.sortBy");
        return value;
    }

    public static showTaskNotifications() {
        return vscode.workspace.getConfiguration().get<boolean>("taskDisplay.showTaskNotifications");
    }

    public static showTodaysTasks(){
        return vscode.workspace.getConfiguration().get<boolean>("todayView.showTodaysTasks");
    }

    public static showOverdueTasks() {
        return vscode.workspace.getConfiguration().get<boolean>("todayView.showOverdueTasks");
    }

    public static getOverdueDaysToDisplay() {
        return vscode.workspace.getConfiguration().get<number>("todayView.overdueDaysToDisplay") ?? 1;
    }

    public static getOverdueDisplayText() {
        return vscode.workspace.getConfiguration().get<string>("todayView.overdueDisplayPrefix") ?? "❗";
    }

    public static useGitIgnore() {
        return vscode.workspace.getConfiguration().get<boolean>("code.todoist.useGitIgnore");
    }

    public static showWorkspaceTodos() {
        return vscode.workspace.getConfiguration().get<boolean>("identifyTodos.display");
    }

    public static getTodosRegEx() {
        return vscode.workspace.getConfiguration().get<string>("identifyTodos.regex")?? "*";
    }

    public static getTodoistData(context: vscode.Memento) {
        const data = context.get<string>(todoistData);
        if (data) {
            return JSON.parse(data) as TodoistState;
        }
        return TODOIST_INITIAL_STATE;
    }

    public static setTodoistData(context: vscode.Memento, data: TodoistState) {
        context.update(todoistData, JSON.stringify(data));
        return;
    }

    public static getSelectedTask(context: vscode.Memento) {
        let taskId = context.get<string>(selectedTask);
        return taskId;
    }

    public static setSelectedTask(context: vscode.Memento, taskId?: string) {
        context.update(selectedTask, taskId);
        return;
    }

    public static setWorkspaceProject(context: vscode.Memento, workspaceName: string, projectId: string) {
        context.update(workspaceName, projectId);
    }

    public static getWorkspaceProject(context: vscode.Memento, workspaceName: string) {
        let projectId = context.get<string>(workspaceName);

        return projectId;
    } 
}
