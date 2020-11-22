import * as vscode from 'vscode';
import { todoistTreeView } from '../models/todoistTreeView';
import settingsHelper from '../helpers/settingsHelper';
import { projectsProvider } from './projectsProvider';

export class workspaceProjectProvider extends projectsProvider {

    private projectId: Number;
    private extContext: vscode.Memento;

    constructor(context: vscode.Memento, projectId: Number) {
        super(context);
        this.projectId = projectId;
        this.extContext = context;
    }

    getTreeItem(element: todoistTreeView): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return super.getTreeItem(element);
    }

    getChildren(element?: todoistTreeView | undefined): vscode.ProviderResult<todoistTreeView[]> {

        if(!element) {
            let projects = settingsHelper.getTodoistData(this.extContext).projects;
            let workspaceProject = projects.filter(p => p.id == this.projectId)[0]; 
            if(!workspaceProject) {
                return null;
            }
            let projectName = workspaceProject.name;
                element = new todoistTreeView(projectName, vscode.TreeItemCollapsibleState.Expanded);
                element.id = this.projectId.toString();
                element.project = workspaceProject;
        }
        
        return super.getChildren(element);
    }
}
