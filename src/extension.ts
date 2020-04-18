// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import settingsHelper from './helpers/settingsHelper';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// On Extension Activation Validating Token -----------------------------------------
	let apiToken = settingsHelper.getTodoistAPIToken(context.globalState);
	if(!apiToken) {
		inputTodoistApiToken();
	}

	
	// Commands -------------------------------------------------------------------------

	context.subscriptions.push(vscode.commands.registerCommand('code-with-todoist.updateToken', () => {
		inputTodoistApiToken();
	}));


	// Functions -------------------------------------------------------------------------
	function inputTodoistApiToken() {
		let options: vscode.InputBoxOptions = {
			ignoreFocusOut: true,
			placeHolder: '',
			prompt: 'Enter your Todoist Integrations API Key. \n Found in Settings > Integrations >	API token',
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
