// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import settingsHelper from './helpers/settingsHelper';
import { projectsProvider } from './features/projectsProvider';
import todoistAPIHelper from './helpers/todoistAPIHelper';
import { taskProvider } from './features/taskProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// On Extension Activation Validating Token -----------------------------------------
	let apiToken = settingsHelper.getTodoistAPIToken(context.globalState);
	if(!apiToken) {
		inputTodoistApiToken();
	}

	settingsHelper.setSelectedTask(context.workspaceState, 0);
	syncTodoist();

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
		taskTreeViewProvider.refresh();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('todoist.sync', () => {
		syncTodoist();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('todoist.openTaskInBrowser', (taskUrl) => {
		vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(taskUrl))
	}));


	function syncTodoist() {
		const apiHelper = new todoistAPIHelper(context.globalState);
		apiHelper.syncProjects().then(() => {
			apiHelper.syncActiveTasks().then(() => {
				apiHelper.syncSections().then(() => {
					vscode.window.showInformationMessage("Synced Todoist");
				}).catch(error => {
					vscode.window.showErrorMessage("Could not sync Todoist sections. " + error);
				});				
			}).catch(error => {
				vscode.window.showErrorMessage("Could not sync Todoist tasks. " + error);
			});
		}).catch(error => {
			vscode.window.showErrorMessage("Could not sync Todoist projects. " + error);
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
export function deactivate() {}
