import * as vscode from 'vscode';
import axios from 'axios';
import settingsHelper from './settingsHelper';
import project from '../models/project';
import task from '../models/task';
import section from '../models/section';

export default class todoistAPIHelper {

    private todoistAPIUrl: String = 'https://api.todoist.com/rest/v2/';
    private apiToken: String;
    private state: vscode.Memento;

    constructor(context: vscode.Memento) {
        this.apiToken = settingsHelper.getTodoistAPIToken()!;
        this.state = context;
    }

    public syncProjects(): Promise<void> {
        const url = this.todoistAPIUrl;
        const jwt = this.apiToken;
        let state = this.state;

        return new Promise(function (resolve, reject) {
            axios.get(encodeURI(url + 'projects'), {
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            }).then(response => {
                if (response.status === 200) {
                    let data = settingsHelper.getTodoistData(state);
                    data.projects = [];
                    response.data.forEach((element: any) => {
                        data.projects.push(project.deserialize(element));
                    });
                    settingsHelper.setTodoistData(state, data);
                    resolve();
                }
                else {
                    reject(response.statusText)
                }
            }).catch(error => {
                if(error.code == "ENOTFOUND") {
                    reject("Check your internet connection.");
                }
                else if(error.response.status === 400) {
                    reject("Ensure Todoist API token is set.");
                }
                else if(error.response.status === 403) {
                    reject("Incorrect Todoist API token. Update the token in the settings.")
                }
                else {
                    reject("Unknown error. " + error.message);
                }
            });
        });
    }

    public syncActiveTasks(): Promise<void> {
        const url = this.todoistAPIUrl;
        const jwt = this.apiToken;
        let state = this.state;

        return new Promise(function (resolve, reject) {
            axios.get(encodeURI(url + 'tasks'), {
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            }).then(response => {
                if (response.status === 200) {
                    let data = settingsHelper.getTodoistData(state);
                    data.tasks = [];
                    response.data.forEach((element: any) => {
                        if(!element.completed)
                            data.tasks.push(task.deserialize(element));
                    });
                    settingsHelper.setTodoistData(state, data);
                    resolve();
                }
                else {
                    reject(response.statusText)
                }
            }).catch(error => {
                if(error.code == "ENOTFOUND") {
                    reject("Check your internet connection.");
                }
                else if(error.response.status === 400) {
                    reject("Ensure Todoist API token is set.");
                }
                else if(error.response.status === 403) {
                    reject("Incorrect Todoist API token. Update the token in the settings.")
                }
                else {
                    reject("Unknown error. " + error.message);
                }
            });
        });
    }

    public syncSections(): Promise<void> {
        const url = this.todoistAPIUrl;
        const jwt = this.apiToken;
        let state = this.state;

        return new Promise(function (resolve, reject) {
            axios.get(encodeURI(url + 'sections'), {
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            }).then(response => {
                if (response.status === 200) {
                    let data = settingsHelper.getTodoistData(state);
                    data.sections = [];
                    response.data.forEach((element: any) => {
                        data.sections.push(section.deserialize(element));
                    });
                    settingsHelper.setTodoistData(state, data);
                    resolve();
                }
                else {
                    reject(response.statusText)
                }
            }).catch(error => {
                if(error.code == "ENOTFOUND") {
                    reject("Check your internet connection.");
                }
                else if(error.response.status === 400) {
                    reject("Ensure Todoist API token is set.");
                }
                else if(error.response.status === 403) {
                    reject("Incorrect Todoist API token. Update the token in the settings.")
                }
                else {
                    reject("Unknown error. " + error.message);
                }
            });
        });
    }

    public closeOpenTask(taskId: Number): Promise<boolean> {
        const url = this.todoistAPIUrl;
        const jwt = this.apiToken;
        
        return new Promise(function (resolve, reject) {
            let requestUrl = encodeURI(url + 'tasks/' + taskId + '/close');
            axios.post(requestUrl, {}, {
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            }).then(response => {
                if (parseInt(response.status.toString()) === 204) {
                    resolve(true);
                }
                else {
                    reject(response.statusText)
                }
            }).catch(error => {
                if(error.code == "ENOTFOUND") {
                    reject("Check your internet connection.");
                }
                else if(error.response.status === 400) {
                    reject("Ensure Todoist API token is set.");
                }
                else if(error.response.status === 403) {
                    reject("Incorrect Todoist API token. Update the token in the settings.")
                }
                else {
                    reject("Unknown error. " + error.message);
                }
            });
        });
    }

    public createProject(projectName: string): Promise<project> {
        const url = this.todoistAPIUrl;
        const jwt = this.apiToken;

        return new Promise(function (resolve, reject) {
            axios.post(encodeURI(url + 'projects'), {
                name: projectName
            }, {
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            }).then(response => {
                if (response.status === 200) {
                    let newProject = project.deserialize(response.data);
                    resolve(newProject);
                }
                else {
                    reject(response.statusText)
                }
            }).catch(error => {
                if(error.code == "ENOTFOUND") {
                    reject("Check your internet connection.");
                }
                else if(error.response.status === 400) {
                    reject("Ensure Todoist API token is set.");
                }
                else if(error.response.status === 403) {
                    reject("Incorrect Todoist API token. Update the token in the settings.")
                }
                else {
                    reject("Unknown error. " + error.message);
                }
            });
        });
    }

    public createTask(taskText: string, project_id: number): Promise<task> {    
        const url = this.todoistAPIUrl;
        const jwt = this.apiToken;

        return new Promise(function (resolve, reject) {  
            axios.post(encodeURI(url + 'tasks'), {
                content: taskText,
                project_id: project_id
            }, {
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            }).then(response => {
                if (response.status === 200) {
                    let newTask = task.deserialize(response.data);
                    resolve(newTask);
                }
                else {
                    reject(response.statusText)
                }
            }).catch(error => {
                if(error.code == "ENOTFOUND") {
                    reject("Check your internet connection.");
                }
                else if(error.response.status === 400) {
                    reject("Ensure Todoist API token is set.");
                }
                else if(error.response.status === 403) {
                    reject("Incorrect Todoist API token. Update the token in the settings.")
                }
                else {
                    reject("Unknown error. " + error.message);
                }
            });
        });
    }


    // TODO : Remove
    public getProjects(): Promise<project[]> {
        const url = this.todoistAPIUrl;
        const jwt = this.apiToken;
        let state = this.state;

        return new Promise(function (resolve, reject) {
            axios.get(encodeURI(url + 'projects'), {
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            }).then(response => {
                if (response.status === 200) {
                    let projects: project[] = [];
                    response.data.forEach((element: any) => {
                        projects.push(project.deserialize(element));
                    });
                    let data = settingsHelper.getTodoistData(state);
                    data.projects = projects;
                    settingsHelper.setTodoistData(state, data);
                    resolve(projects);
                }
                else {
                    reject(Error(response.statusText))
                }
            }).catch(error => {
                reject(Error(error));
            });
        });
    }

    public getActiveTasks(): Promise<task[]> {
        const url = this.todoistAPIUrl;
        const jwt = this.apiToken;
        let state = this.state;

        return new Promise(function (resolve, reject) {
            axios.get(encodeURI(url + 'tasks'), {
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            }).then(response => {
                if (response.status === 200) {
                    let tasks: task[] = [];
                    response.data.forEach((element: any) => {
                        tasks.push(task.deserialize(element));
                    });
                    let data = settingsHelper.getTodoistData(state);
                    data.tasks = tasks;
                    settingsHelper.setTodoistData(state, data);
                    resolve(tasks);
                }
                else {
                    reject(Error(response.statusText))
                }
            }).catch(error => {
                reject(Error(error));
            });
        });
    }
}
