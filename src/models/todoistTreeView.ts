import * as vscode from 'vscode';
import project from './project';
import task from './task';
import section from './section';

export class todoistTreeView extends vscode.TreeItem {
    project!: project;
    task!: task;
    section!: section;
}

