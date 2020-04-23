// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import settingsHelper from './helpers/settingsHelper';
import { projectsProvider } from './features/projectsProvider';
import todoistAPIHelper from './helpers/todoistAPIHelper';
import { taskProvider } from './features/taskProvider';
import task from './models/task';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// On Extension Activation Validating Token -----------------------------------------
	let apiToken = settingsHelper.getTodoistAPIToken(context.globalState);
	if (!apiToken) {
		inputTodoistApiToken();
	}

	settingsHelper.setSelectedTask(context.workspaceState, 0);
	const lastSyncTime = new Date(settingsHelper.getTodoistData(context.globalState).lastSyncTime).getTime();
	const currentTime = new Date().getTime();
	if (currentTime - lastSyncTime > 600000) { // 10 minutes
		syncTodoist();
	}

	const projectsTreeViewProvider = new projectsProvider(context.globalState);
	const taskTreeViewProvider = new taskProvider(context);
	vscode.window.registerTreeDataProvider('projects', projectsTreeViewProvider)
	vscode.window.registerTreeDataProvider('task', taskTreeViewProvider);

	// Commands -------------------------------------------------------------------------

	context.subscriptions.push(vscode.commands.registerCommand('todoist.updateToken', () => {
		inputTodoistApiToken();
	}));

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

	context.subscriptions.push(vscode.commands.registerCommand('todoist.closeTask', (task : task) => {
		let taskId : Number;
		if(task) {
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
	}));


	function syncTodoist() {
		const state = context.globalState;
		const apiHelper = new todoistAPIHelper(state);
		const projectsTreeViewProvider = new projectsProvider(state);

		const progressOptions :vscode.ProgressOptions = {
			location: vscode.ProgressLocation.Notification,
			title: "Syncing with Todoist",
			cancellable: false
		};
		vscode.window.withProgress(progressOptions, (progress, token) => {
			token.onCancellationRequested(() => {});
			progress.report({ increment: 0 });
			
			return  new Promise(resolve => {
				apiHelper.syncProjects().then(() => {
					progress.report({ increment: 33 });
					apiHelper.syncActiveTasks().then(() => {
						progress.report({ increment: 66 });
						apiHelper.syncSections().then(() => {
							progress.report({ increment: 100, message: "Completed sync!" });
							let data = settingsHelper.getTodoistData(state);
							data.lastSyncTime = new Date();
							settingsHelper.setTodoistData(state, data);
							vscode.window.registerTreeDataProvider('projects', projectsTreeViewProvider);
							projectsTreeViewProvider.refresh();
							resolve();
						}).catch(error => {
							vscode.window.showErrorMessage("Could not sync Todoist sections. " + error);
						});
					}).catch(error => {
						vscode.window.showErrorMessage("Could not sync Todoist tasks. " + error);
					});
				}).catch(error => {
					vscode.window.showErrorMessage("Could not sync Todoist projects. " + error);
				});
			});
			
		});		
	}

	// Functions -------------------------------------------------------------------------
	function inputTodoistApiToken() {
		let options: vscode.InputBoxOptions = {
			ignoreFocusOut: true,
			placeHolder: '',
			prompt: 'Enter your Todoist Integrations API Key. \n Found in Settings > Integrations >	API token\n ',
			value: apiToken
		};
		vscode.window.showInputBox(options).then(input => {
			if (input) {
				settingsHelper.setTodoistAPIToken(context.globalState, input);
				apiToken = settingsHelper.getTodoistAPIToken(context.globalState);
			}
		});
	}
}

// this method is called when your extension is deactivated
export function deactivate() { }
