import * as vscode from 'vscode';
import axios from 'axios';
import settingsHelper from './settingsHelper';
import project from '../models/project';
import { resolveCliPathFromVSCodeExecutablePath } from 'vscode-test';
import task from '../models/task';

export default class todoistAPIHelper {

    private todoistAPIUrl : String = 'https://api.todoist.com/rest/v1/';
    private apiToken : String;

    constructor(context: vscode.Memento) {
        this.apiToken = settingsHelper.getTodoistAPIToken(context)!;
    }

    public getProjects(): Promise<project[]> {
        const url = this.todoistAPIUrl;
        const jwt = this.apiToken;

        return new Promise(function(resolve, reject) {
            axios.get( encodeURI(url + 'projects'), {
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            }).then(response => {
                if(response.status === 200) {
                    let projects : project[] = [];
                    response.data.forEach((element: any)=> {
                        projects.push(project.deserialize(element));
                    });
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

    public getActiveTasks(projectId: string): Promise<task[]> {
        const url = this.todoistAPIUrl;
        const jwt = this.apiToken;

        return new Promise(function(resolve, reject) {
            axios.get( encodeURI(url + 'tasks?project_id=' + projectId), {
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            }).then(response => {
                if(response.status === 200) {
                    let tasks : task[] = [];
                    response.data.forEach((element: any)=> {
                        tasks.push(task.deserialize(element));
                    });
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