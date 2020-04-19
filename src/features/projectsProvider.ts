import * as vscode from 'vscode';
import project from '../models/project';
import todoistAPIHelper from '../helpers/todoistAPIHelper';
import task from '../models/task';
import { todoistTreeView } from '../models/todoistTreeView';

export class projectsProvider implements vscode.TreeDataProvider<todoistTreeView> {

    private apiHelper : todoistAPIHelper;
    private state : vscode.Memento;
    onDidChangeTreeData?: vscode.Event<todoistTreeView | null | undefined> | undefined;

    constructor(context: vscode.Memento) {
        this.state = context;
        this.apiHelper = new todoistAPIHelper(context);
    }

    getTreeItem(element: todoistTreeView): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: todoistTreeView | undefined): vscode.ProviderResult<todoistTreeView[]> {
        if(element) {
            const api = this.apiHelper;
            let cc : Promise<todoistTreeView[]>= new Promise(function(resolve, reject) {
                api.getActiveTasks(element.id!).then((tasks: task[]) => {
                    tasks = tasks.sort((a, b) => a.order > b.order ? 1 : 0);
                    let activeTasks : todoistTreeView[] = [];
                    tasks.forEach(t => {
                        let temp = new todoistTreeView(t.content);
                        temp.id = t.id.toString();
                        temp.tooltip = t.content;
                        temp.collapsibleState = vscode.TreeItemCollapsibleState.None,
                        temp.task = t;
                        activeTasks.push(temp);
                    });
                    resolve(activeTasks);                
                });
            });            
            return Promise.resolve(cc);
        }
        else {

            const api = this.apiHelper;
            let cc : Promise<todoistTreeView[]>= new Promise(function(resolve, reject) {
                api.getProjects().then((projects: project[]) => {
                    let displayProjects : todoistTreeView[] = [];
                    projects = projects.sort((a, b) => a.order > b.order ? 1 : 0);
                    projects.filter(p => !p.parent).forEach(p => {
                        let temp = new todoistTreeView(p.name);
                        temp.id = p.id.toString();
                        temp.tooltip = p.name;
                        temp.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed,
                        temp.project = p;
                        displayProjects.push(temp);
                    });
                    resolve(displayProjects);                
                });
            });            
            return Promise.resolve(cc);
        }
    }



}