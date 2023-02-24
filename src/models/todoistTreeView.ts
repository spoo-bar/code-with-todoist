import * as vscode from 'vscode';
import { ProjectQuickPick } from './project';
import { Task, Section } from '@doist/todoist-api-typescript';

export class TodoistTreeItem extends vscode.TreeItem {
    project!: ProjectQuickPick;
    task!: Task;
    section!: Section;
}

