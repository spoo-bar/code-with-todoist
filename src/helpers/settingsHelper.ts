import type { TodoistState } from '../types';
import { workspace, Memento } from 'vscode';
import { TODOIST_INITIAL_STATE, SORT_BY, CONTEXT_KEYS } from '../constants';

export default class SettingsHelper {
    public static getSyncInterval() {
        return workspace.getConfiguration().get<number>("syncInternval") ?? 600000;
    }

    public static getTaskSortBy() {
        const value = workspace.getConfiguration().get<SORT_BY>("taskDisplay.sortBy");
        return value;
    }

    public static showTaskNotifications() {
        return workspace.getConfiguration().get<boolean>("taskDisplay.showTaskNotifications");
    }

    public static showTodaysTasks() {
        return workspace.getConfiguration().get<boolean>("todayView.showTodaysTasks");
    }

    public static showOverdueTasks() {
        return workspace.getConfiguration().get<boolean>("todayView.showOverdueTasks");
    }

    public static getOverdueDaysToDisplay() {
        return workspace.getConfiguration().get<number>("todayView.overdueDaysToDisplay") ?? 1;
    }

    public static getOverdueDisplayText() {
        return workspace.getConfiguration().get<string>("todayView.overdueDisplayPrefix") ?? "❗";
    }

    public static useGitIgnore() {
        return workspace.getConfiguration().get<boolean>("code.todoist.useGitIgnore");
    }

    public static showWorkspaceTodos() {
        return workspace.getConfiguration().get<boolean>("identifyTodos.display");
    }

    public static getTodosRegEx() {
        return workspace.getConfiguration().get<string>("identifyTodos.regex") ?? "*";
    }

    public static getTodoistData(context: Memento) {
        const data = context.get<string>(CONTEXT_KEYS.TODOIST_DATA);
        if (data) {
            return JSON.parse(data) as TodoistState;
        }
        return TODOIST_INITIAL_STATE;
    }

    public static setTodoistData(context: Memento, data: TodoistState) {
        context.update(CONTEXT_KEYS.TODOIST_DATA, JSON.stringify(data));
        return;
    }

    public static getSelectedTask(context: Memento) {
        let taskId = context.get<string>(CONTEXT_KEYS.TODOIST_SELECTED_TASK);
        return taskId;
    }

    public static setSelectedTask(context: Memento, taskId?: string) {
        context.update(CONTEXT_KEYS.TODOIST_SELECTED_TASK, taskId);
        return;
    }

    public static setWorkspaceProject(context: Memento, workspaceName: string, projectId: string) {
        context.update(workspaceName, projectId);
    }

    public static getWorkspaceProject(context: Memento, workspaceName: string) {
        let projectId = context.get<string>(workspaceName);

        return projectId;
    }
}
