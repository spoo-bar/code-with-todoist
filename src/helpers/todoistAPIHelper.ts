import * as vscode from 'vscode';
import { TodoistApi } from '@doist/todoist-api-typescript';
import SettingsHelper from './settingsHelper';
import { normalizeToProjectQuickPick } from '../models/project';
import type { Project, Task, Section } from '@doist/todoist-api-typescript';

export default class TodoistAPIHelper {

    private apiToken: string;
    private state: vscode.Memento;

    constructor(context: vscode.Memento) {
        this.apiToken = SettingsHelper.getTodoistAPIToken()!;
        this.state = context;
    }

    public async syncProjects() {
        const state = this.state;

        const api = new TodoistApi(this.apiToken);

        const responseProjects = await api.getProjects().catch(() => [] as Project[]);

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

        const api = new TodoistApi(this.apiToken);
        const responseTasks = await api.getTasks().catch(() => [] as Task[]);

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

        const api = new TodoistApi(this.apiToken);
        const responseSections = await api.getSections().catch(() => [] as Section[]);

        // Do not update if there are no sections (an error occurred)
        if (responseSections.length === 0) {
            return;
        }

        let data = SettingsHelper.getTodoistData(state);
        data.sections = responseSections;

        SettingsHelper.setTodoistData(state, data);
    }

    public async closeOpenTask(taskId: string) {
        const api = new TodoistApi(this.apiToken);

        try {
            const response = await api.closeTask(taskId);
            return response;
        } catch {
            throw new Error("Something went wrong when closing the task.");
        }
    }

    public async createProject(projectName: string) {
        const api = new TodoistApi(this.apiToken);

        try {
            const newProject = await api.addProject({ name: projectName });
            return normalizeToProjectQuickPick(newProject);
        } catch {
            return "Something went wrong when creating the project.";
        }
    }

    public async createTask(taskText: string, projectId?: string) {    
        const api = new TodoistApi(this.apiToken);

        try {
            const newTask = await api.addTask({ content: taskText, projectId });
            return newTask;
        } catch {
            throw new Error("Something went wrong when creating the task.");
        }
    }


    // TODO : Remove
    public async getProjects() {
        const state = this.state;

        const api = new TodoistApi(this.apiToken);
        const responseProjects = await api.getProjects().catch(() => [] as Project[]);

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

        const api = new TodoistApi(this.apiToken);
        const activeTasks = await api.getTasks().catch(() => [] as Task[]);

        let data = SettingsHelper.getTodoistData(state);
        data.tasks = activeTasks;

        SettingsHelper.setTodoistData(state, data);

        return activeTasks;
    }
}
