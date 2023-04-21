import * as vscode from 'vscode';
import { TodoistApi, type TodoistRequestError } from '@doist/todoist-api-typescript';
import SettingsHelper from './settingsHelper';
import { normalizeToProjectQuickPick } from './normalizeProject';
import SecretsHelper from './secretsHelper';

export default class TodoistAPIHelper {
    private state: vscode.Memento;

    constructor(context: vscode.Memento) {
        this.state = context;
    }

    public async syncProjects() {
        const state = this.state;

        const api = await this.createApiClient();

        const responseProjects = await api.getProjects().catch(this.handleApiRequestError);

        // Do not update if there are no projects (an error occurred)
        if (responseProjects.length === 0) {
            return;
        }

        let data = SettingsHelper.getTodoistData(state);
        data.projects = [];

        responseProjects.forEach((apiProject) => {
            data.projects.push(normalizeToProjectQuickPick(apiProject));
        });

        SettingsHelper.setTodoistData(state, data);
    }

    public async syncActiveTasks(): Promise<void> {
        const state = this.state;

        const api = await this.createApiClient();
        const responseTasks = await api.getTasks().catch(this.handleApiRequestError);

        // Do not update if there are no tasks (an error occurred)
        if (responseTasks.length === 0) {
            return;
        }

        let data = SettingsHelper.getTodoistData(state);
        data.tasks = responseTasks;

        SettingsHelper.setTodoistData(state, data);
    }

    public async syncSections() {
        let state = this.state;

        const api = await this.createApiClient();
        const responseSections = await api.getSections().catch(this.handleApiRequestError);

        // Do not update if there are no sections (an error occurred)
        if (responseSections.length === 0) {
            return;
        }

        let data = SettingsHelper.getTodoistData(state);
        data.sections = responseSections;

        SettingsHelper.setTodoistData(state, data);
    }

    public async closeOpenTask(taskId: string) {
        const api = await this.createApiClient();

        try {
            const response = await api.closeTask(taskId);
            return response;
        } catch {
            throw new Error("Something went wrong when closing the task.");
        }
    }

    public async createProject(projectName: string) {
        const api = await this.createApiClient();

        try {
            const newProject = await api.addProject({ name: projectName });
            return normalizeToProjectQuickPick(newProject);
        } catch {
            return "Something went wrong when creating the project.";
        }
    }

    public async createTask(taskText: string, projectId?: string) {
        const api = await this.createApiClient();

        try {
            const newTask = await api.addTask({ content: taskText, projectId });
            return newTask;
        } catch {
            throw new Error("Something went wrong when creating the task.");
        }
    }


    public async getProjects() {
        const state = this.state;

        const api = await this.createApiClient();
        const responseProjects = await api.getProjects().catch(this.handleApiRequestError);

        // Do not update if there are no projects (an error occurred)
        if (responseProjects.length === 0) {
            throw new Error("Something went wrong when getting the projects.");
        }

        let data = SettingsHelper.getTodoistData(state);
        data.projects = [];

        responseProjects.forEach((apiProject) => {
            data.projects.push(normalizeToProjectQuickPick(apiProject));
        });

        SettingsHelper.setTodoistData(state, data);

        return data.projects;
    }

    public async getActiveTasks() {
        const state = this.state;

        const api = await this.createApiClient();
        const activeTasks = await api.getTasks().catch(this.handleApiRequestError);

        let data = SettingsHelper.getTodoistData(state);
        data.tasks = activeTasks;

        SettingsHelper.setTodoistData(state, data);

        return activeTasks;
    }

    private async createApiClient() {
        const apiToken = await SecretsHelper.getSecret("apiToken");
        if (!apiToken) {
            throw new Error("API token is not set.");
        }
        return new TodoistApi(apiToken);
    }

    private handleApiRequestError(error: TodoistRequestError): never[] {
        if (error.httpStatusCode === 400) {
            throw new Error("Ensure Todoist API token is set. You can configure your API token using the 'Todoist: Set API Token' command.");
        }
        else if (error.isAuthenticationError()) {
            throw new Error("Incorrect Todoist API token. Configure your API token using the 'Todoist: Set API Token' command.");
        }
        else {
            throw new Error("Unknown error. " + error.message);
        }
    }

}
