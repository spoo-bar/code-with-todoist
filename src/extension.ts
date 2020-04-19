// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import settingsHelper from './helpers/settingsHelper';
import { projectsProvider } from './features/projectsProvider';
import todoistAPIHelper from './helpers/todoistAPIHelper';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// On Extension Activation Validating Token -----------------------------------------
	let apiToken = settingsHelper.getTodoistAPIToken(context.globalState);
	if(!apiToken) {
		inputTodoistApiToken();
	}

	syncTodoist();

	vscode.window.registerTreeDataProvider('projects', new projectsProvider(context.globalState))
	
	// Commands -------------------------------------------------------------------------

	context.subscriptions.push(vscode.commands.registerCommand('todoist.updateToken', () => {
		inputTodoistApiToken();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('todoist.openTask', (taskId) => {
		vscode.window.showInformationMessage(`Selected taask ${taskId}`);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('todoist.sync', () => {
		syncTodoist();
	}));


	function syncTodoist() {
		const apiHelper = new todoistAPIHelper(context.globalState);
		apiHelper.syncProjects().then(() => {
			apiHelper.syncActiveTasks().then(() => {
				vscode.window.showInformationMessage("Synced Todoist");
			}).catch(error => {
				vscode.window.showErrorMessage("Could not sync Todoist tasks. " + error);
			});
		}).catch(error => {
			vscode.window.showErrorMessage("Could not sync Todoist tasks. " + error);
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
