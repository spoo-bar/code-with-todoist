import * as vscode from 'vscode';
import project from './project';
import task from './task';

export class todoistTreeView extends vscode.TreeItem {
    project!: project;
    task!: task;
}

