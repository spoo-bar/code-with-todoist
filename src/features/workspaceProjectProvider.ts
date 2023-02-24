import * as vscode from 'vscode';
import { TodoistTreeItem } from '../models/todoistTreeView';
import SettingsHelper from '../helpers/settingsHelper';
import { ProjectsProvider } from './projectsProvider';

export class WorkspaceProjectProvider extends ProjectsProvider {

    private projectId: string | undefined;
    private extContext: vscode.Memento;

    constructor(context: vscode.Memento, projectId: string | undefined) {
        super(context);
        this.projectId = projectId;
        this.extContext = context;
    }

    getTreeItem(element: TodoistTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return super.getTreeItem(element);
    }

    getChildren(element?: TodoistTreeItem | undefined): vscode.ProviderResult<TodoistTreeItem[]> {

        if(!element) {
            let projects = SettingsHelper.getTodoistData(this.extContext).projects;
            let workspaceProject = projects.filter(p => p.id === this.projectId)[0]; 
            if(!workspaceProject) {
                return null;
            }
            let projectName = workspaceProject.name;
                element = new TodoistTreeItem(projectName, vscode.TreeItemCollapsibleState.Expanded);
                element.id = this.projectId;
                element.project = workspaceProject;
        }
        
        return super.getChildren(element);
    }
}
