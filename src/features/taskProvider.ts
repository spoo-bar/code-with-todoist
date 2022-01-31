import * as vscode from 'vscode';
import { todoistTreeView } from '../models/todoistTreeView';
import settingsHelper from '../helpers/settingsHelper';
import task from '../models/task';

export class taskProvider implements vscode.TreeDataProvider<todoistTreeView> {

    private context: vscode.ExtensionContext;
    private taskId: Number | undefined;

    private _onDidChangeTreeData: vscode.EventEmitter<todoistTreeView | undefined> = new vscode.EventEmitter<todoistTreeView | undefined>();
    onDidChangeTreeData?: vscode.Event<todoistTreeView | null | undefined> | undefined = this._onDidChangeTreeData.event;

    refresh(data: todoistTreeView | undefined): void {
        this.taskId = settingsHelper.getSelectedTask(this.context.workspaceState);
        this._onDidChangeTreeData.fire(data);
    }

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.taskId = settingsHelper.getSelectedTask(this.context.workspaceState);
    }

    getTreeItem(element: any): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: any): vscode.ProviderResult<any[]> {
        if (this.taskId && this.taskId !== 0) {
            const data = settingsHelper.getTodoistData(this.context.globalState);
            const tasks = data.tasks.filter(t => t.id === this.taskId);
            if (tasks && tasks.length > 0) {
                return Promise.resolve(new Promise(function (resolve, reject) {
                    const task = tasks[0];
                    let treeView: todoistTreeView[] = [];

                    // Showing task text
                    // todo allow tast rename
                    let taskTitle = new todoistTreeView(task.content);
                    taskTitle.collapsibleState = vscode.TreeItemCollapsibleState.None;
                    taskTitle.id = task.id.toString() + '_task';
                    taskTitle.description = task.description;
                    taskTitle.tooltip = new vscode.MarkdownString(task.content);
                    treeView.push(taskTitle);

                    // todo show description
                    // todo allow task description change

                    // todo show priority
                    // todo allow priority change

                    // Showing the due time of the task
                    // todo allow due date change
                    let taskParent = new todoistTreeView("Due");
                    taskParent.collapsibleState = vscode.TreeItemCollapsibleState.None;
                    if (task.due) {
                        taskParent.id = task.id.toString() + task.due.date;
                        taskParent.description = new Date(task.due.date).toLocaleDateString();
                        taskParent.tooltip = task.due.string;
                    }
                    else {
                        taskParent.id = task.id.toString() + "nodue";
                        taskParent.description = " *not set* ";
                        taskParent.tooltip = new vscode.MarkdownString("*Due date not set*");
                    }
                    treeView.push(taskParent);


                    // Showing if the task is completed or pending
                    let taskCompletion = new todoistTreeView("Completed");
                    taskCompletion.collapsibleState = vscode.TreeItemCollapsibleState.None;
                    taskCompletion.id = task.id.toString() + task.completed;
                    taskCompletion.description = taskCompletion.tooltip = task.completed ? "Completed" : "Pending";
                    treeView.push(taskCompletion);

                    // Showing project the task belongs too
                    // todo add icon of colour
                    const project = data.projects.filter(p => p.id === task.project_id);
                    if (project.length > 0) {
                        let taskProject = new todoistTreeView("Project");
                        taskProject.collapsibleState = vscode.TreeItemCollapsibleState.None;
                        taskProject.id = project[0].id.toString();
                        taskProject.description = project[0].name;
                        taskProject.tooltip = project[0].name;
                        treeView.push(taskProject);
                    }

                    // Showing parent task of the selected task
                    const parent = data.tasks.filter(p => p.id === task.parent_id);
                    if (parent.length > 0) {
                        let taskParent = new todoistTreeView("Parent");
                        taskParent.collapsibleState = vscode.TreeItemCollapsibleState.None;
                        taskParent.id = parent[0].id.toString();
                        taskParent.description = parent[0].content;
                        taskParent.tooltip = parent[0].content;
                        treeView.push(taskParent);
                    }

                    // Showing the section the task is part of
                    const section = data.sections.filter(s => s.id === task.section_id);
                    if (section.length > 0) {
                        let taskSection = new todoistTreeView("Section");
                        taskSection.collapsibleState = vscode.TreeItemCollapsibleState.None;
                        taskSection.id = section[0].id.toString();
                        taskSection.description = section[0].name;
                        taskSection.tooltip = section[0].name;
                        treeView.push(taskSection);
                    }


                    // todo Add labels

                    // todo Add comments


                    // Showing empty line before showing the Open in Browser button
                    let emptyTask = new todoistTreeView("");
                    emptyTask.collapsibleState = vscode.TreeItemCollapsibleState.None;
                    emptyTask.id = 'emptyBeforeClose';
                    treeView.push(emptyTask);

                    // Showing button to open task in browser
                    let openInBrowser = new todoistTreeView("Open in Browser 🌐");
                    openInBrowser.collapsibleState = vscode.TreeItemCollapsibleState.None;
                    openInBrowser.id = task.id.toString() + "_browser";
                    openInBrowser.tooltip = new vscode.MarkdownString("Click to open task in browser");
                    openInBrowser.command = {
                        command: 'todoist.openTaskInBrowser',
                        title: 'Open task in Browser',
                        arguments: [task.url],
                        tooltip: 'Open task in Browser'
                    };
                    treeView.push(openInBrowser);


                    resolve(treeView);
                }));
            }

        }
        return Promise.resolve([]);
    }



}