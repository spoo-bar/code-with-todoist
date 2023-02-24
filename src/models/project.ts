import * as vscode from 'vscode';
import { Project } from '@doist/todoist-api-typescript';

export type ProjectQuickPick = Project & vscode.QuickPickItem;

export function normalizeToProjectQuickPick(apiProject: Project): ProjectQuickPick {
    const label = apiProject.isFavorite ? `⭐ ${apiProject.name}` : apiProject.name;

    return { ...apiProject, label, alwaysShow: true };
}
