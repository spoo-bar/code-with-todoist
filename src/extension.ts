// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import settingsHelper from './helpers/settingsHelper';
import { projectsProvider } from './features/projectsProvider';
import todoistAPIHelper from './helpers/todoistAPIHelper';
import { taskProvider } from './features/taskProvider';
import task from './models/task';
import { todoist } from './models/todoist';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// On Extension Activation Validating Token -----------------------------------------
	const apiToken = settingsHelper.getTodoistAPIToken();
	const projectsTreeViewProvider = new projectsProvider(context.globalState);
	const taskTreeViewProvider = new taskProvider(context);

	if (!apiToken) {
		vscode.window.showErrorMessage("Todoist API token not found. Set it under File > Preferences > Settings > Code With Todoist");
	}
	else {
		initTreeView();
	}

	// Commands -------------------------------------------------------------------------

	context.subscriptions.push(vscode.commands.registerCommand('todoist.openTask', (taskId) => {
		settingsHelper.setSelectedTask(context.workspaceState, parseInt(taskId));
		vscode.commands.executeCommand('setContext', 'taskSelected', true);
		taskTreeViewProvider.refresh();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('todoist.sync', () => {
		syncTodoist();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('todoist.openTaskInBrowser', (taskUrl) => {
		vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(taskUrl))
	}));

	context.subscriptions.push(vscode.commands.registerCommand('todoist.closeTask', (task: task) => {
		closeSelectedTask(task);
	}));

	// Functions -------------------------------------------------------------------------

	function closeSelectedTask(task: task) {
		let taskId: Number;
		if (task) {
			taskId = task.id;
		}
		else {
			taskId = settingsHelper.getSelectedTask(context.workspaceState);
		}
		vscode.window.showInformationMessage("Are you sure you want to mark the task as done?", {
			modal: false
		}, 'Yes', 'No').then(response => {
			if (response == 'Yes') {
				const apiHelper = new todoistAPIHelper(context.globalState);
				apiHelper.closeOpenTask(taskId).then(response => {
					if (response) {
						vscode.commands.executeCommand('setContext', 'taskSelected', false);
						syncTodoist();
					}
				}).catch(err => {
					vscode.window.showErrorMessage(err);
				});
			}
		});
	}

	function initTreeView() {
		settingsHelper.setSelectedTask(context.workspaceState, 0);
		let lastSyncTime = new Date(settingsHelper.getTodoistData(context.globalState).lastSyncTime).getTime();
		if(isNaN(lastSyncTime)) {
			lastSyncTime = new Date(0, 0, 0).getTime();
		}
		const currentTime = new Date().getTime();
		if (currentTime - lastSyncTime > 600000) { // 10 minutes
			syncTodoist();
		}
		vscode.window.registerTreeDataProvider('projects', projectsTreeViewProvider);
		vscode.window.registerTreeDataProvider('task', taskTreeViewProvider);
		
	}

	function syncTodoist() {
		const state = context.globalState;
		const apiHelper = new todoistAPIHelper(state);
		const projectsTreeViewProvider = new projectsProvider(state);

		const progressOptions: vscode.ProgressOptions = {
			location: vscode.ProgressLocation.Notification,
			title: "Syncing with Todoist",
			cancellable: false
		};
		vscode.window.withProgress(progressOptions, (progress, token) => {
			token.onCancellationRequested(() => { });
			progress.report({ increment: 1 });

			return new Promise(resolve => {
				apiHelper.syncProjects().then(() => {
					progress.report({ increment: 33 });
					apiHelper.syncActiveTasks().then(() => {
						progress.report({ increment: 33 });
						apiHelper.syncSections().then(() => {
							progress.report({ increment: 33, message: "Completed sync!" });
							let data = settingsHelper.getTodoistData(state);
							data.lastSyncTime = new Date();
							settingsHelper.setTodoistData(state, data);
							vscode.window.registerTreeDataProvider('projects', projectsTreeViewProvider);
							projectsTreeViewProvider.refresh();
							resolve();
						}).catch(error => {
							vscode.window.showErrorMessage("Todoist Sync failed. " + error);
							resolve();
						});
					}).catch(error => {
						vscode.window.showErrorMessage("Todoist Sync failed. " + error);
						resolve();
					});
				}).catch(error => {
					vscode.window.showErrorMessage("Todoist Sync failed. " + error);
					resolve();
				});
			});

		});
	}
}

// this method is called when your extension is deactivated
export function deactivate() { }
