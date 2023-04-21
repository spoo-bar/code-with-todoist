import type { Task } from '@doist/todoist-api-typescript';

import * as vscode from 'vscode';
import SettingsHelper from './helpers/settingsHelper';
import { ProjectsProvider } from './features/projectsProvider';
import TodoistAPIHelper from './helpers/todoistAPIHelper';
import { TaskProvider } from './features/taskProvider';
import { TodayTaskProvider } from './features/todayTaskProvider';
import { WorkspaceProjectProvider } from './features/workspaceProjectProvider';
import NotificationHelper from './helpers/notificationHelper';
import SecretsHelper from './helpers/secretsHelper';


let syncInterval!: NodeJS.Timeout;
let taskNotifications!: NodeJS.Timeout[];

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	// On Extension Activation Validating Token -----------------------------------------
	SecretsHelper.configureSecretsHelper(context.secrets);
	const apiToken = await SecretsHelper.getSecret('apiToken');

	const projectsTreeViewProvider = new ProjectsProvider(context.globalState);
	const taskTreeViewProvider = new TaskProvider(context);
	const todayTaskViewProvider = new TodayTaskProvider(context.globalState);
	let workspaceProjectTreeViewProvider: WorkspaceProjectProvider;

	if (!apiToken) {
		vscode.window.showErrorMessage("Todoist API token not found. Run command `Todoist: Set API Token` to set your API token.");
	}
	else {
		syncInterval = setInterval(syncTodoist, SettingsHelper.getSyncInterval());
		initTreeView();
	}

	if (SettingsHelper.showTodaysTasks()) {
		vscode.commands.executeCommand('setContext', 'showTodaysTasks', true);
	}

	if (SettingsHelper.showTaskNotifications()) {
		taskNotifications = NotificationHelper.setupTaskNotifications(context.globalState);
	}

	// TODO - Add support for workspace todos

	// Commands -------------------------------------------------------------------------

	context.subscriptions.push(vscode.commands.registerCommand('todoist.setApiToken', () => {
		SecretsHelper.requestSecretInputToUser({ prompt: "Enter your Todoist API token" }).then(apiToken => {
			if (!apiToken) {
				return;
			}
			SecretsHelper.setSecret('apiToken', apiToken);
		});
	}));

	context.subscriptions.push(vscode.commands.registerCommand('todoist.openTask', (taskId) => {
		SettingsHelper.setSelectedTask(context.workspaceState, taskId);
		vscode.commands.executeCommand('setContext', 'taskSelected', true);
		taskTreeViewProvider.refresh(undefined);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('todoist.sync', () => {
		syncTodoist();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('todoist.openTaskInBrowser', (taskUrl) => {
		vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(taskUrl));
	}));

	context.subscriptions.push(vscode.commands.registerCommand('todoist.closeTask', (task: Task) => {
		if (task) {
			closeSelectedTask(task);
		}
		else {
			vscode.window.showErrorMessage("No task was selected. Select a task from the sidebar.");
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('todoist.openCustomTask', (filePath: vscode.Uri, line: number, column: number) => {
		openCustomTask(filePath, line, column);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('todoist.attachproject', async () => {
		if (!vscode.workspace.name) {
			vscode.window.showErrorMessage("You have not yet opened a folder. Open a folder and retry.");
			return;
		}

		let workspaceName = vscode.workspace.name;
		const projectId = SettingsHelper.getWorkspaceProject(context.globalState, workspaceName);

		if (!projectId) {
			attachworkspaceProject();
			return;
		}

		const ALERT_MESSAGE = "There is already a project attached to this workspace. Do you want to overwrite it?";
		const OPTIONS = ['Yes', 'No'] as const;

		const response = await vscode.window.showInformationMessage(ALERT_MESSAGE, { modal: false }, ...OPTIONS);

		if (response === OPTIONS[0]) {
			attachworkspaceProject();
		}

	}));

	// context.subscriptions.push(vscode.commands.registerCommand('todoist.addProject', () => {
	// 	vscode.window.showInputBox({
	// 		prompt: 'New Project Name',
	// 	}).then(projectName =>  {
	// 		if(projectName) {
	// 			vscode.window.showInformationMessage('Project : ' + projectName + ' is being created.');
	// 			const state = context.globalState;
	// 			const apiHelper = new todoistAPIHelper(state);
	// 			apiHelper.createProject(projectName).then(project => {
	// 				syncTodoist();
	// 				vscode.window.showInformationMessage('Project : ' + project.name + ' has been created.');
	// 			});
	// 		}
	// 	});
	// }));

	context.subscriptions.push(vscode.commands.registerCommand('todoist.createTask', async () => {
		let projectName = "Inbox";
		let workspaceProjectId: string | undefined;

		if (vscode.workspace.name) {
			workspaceProjectId = SettingsHelper.getWorkspaceProject(context.globalState, vscode.workspace.name);

			if (workspaceProjectId) {
				let projects = SettingsHelper.getTodoistData(context.globalState).projects;
				projectName = projects.filter(p => p.id === workspaceProjectId)[0].name;
			}
		}

		const taskName = await vscode.window.showInputBox({ prompt: "Creating task under project : " + projectName });

		if (!taskName) {
			return;
		}

		const progressOptions: vscode.ProgressOptions = {
			location: vscode.ProgressLocation.Notification,
			title: "Creating task '" + taskName + "' under project : " + projectName,
			cancellable: false
		};

		vscode.window.withProgress(progressOptions, (progress, token) => {
			token.onCancellationRequested(() => { });
			progress.report({ message: '', increment: 1 });

			return new Promise(resolve => {
				const state = context.globalState;
				const apiHelper = new TodoistAPIHelper(state);
				progress.report({ message: '', increment: 50 });

				apiHelper.createTask(taskName, workspaceProjectId).then(task => {
					progress.report({ message: '', increment: 50 });
					syncTodoist();
					resolve(undefined);
				}).catch((err) => {
					vscode.window.showErrorMessage(err);

				});
			});

		});
	}));

	// Event Handlers  -------------------------------------------------------------------

	context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(function () {
		if (vscode.workspace.name) {
			vscode.commands.executeCommand('setContext', 'workspaceOpen', true);
		}
		else {
			vscode.commands.executeCommand('setContext', 'workspaceOpen', false);
		}
	}));

	// Functions -------------------------------------------------------------------------

	function openCustomTask(filePath: vscode.Uri, line: number, column: number) {
		vscode.workspace.openTextDocument(filePath).then(document => {
			vscode.window.showTextDocument(document).then(editor => {
				let highLightStart = new vscode.Position(line, 0);
				let highLightStop = new vscode.Position(line, column);

				editor.selection = new vscode.Selection(highLightStart, highLightStop);
				editor.revealRange(editor.selection, vscode.TextEditorRevealType.InCenter);
			});
		});
	}

	async function closeSelectedTask(task: Task) {
		const taskId = task ? task.id : SettingsHelper.getSelectedTask(context.workspaceState);

		if (!taskId) {
			vscode.window.showErrorMessage("No task was selected");
			return;
		}

		const OPTIONS = ['Yes', 'No'] as const;
		const INFORMATION_MESSAGE = "Are you sure you want to mark the task as done?";

		const response = await vscode.window.showInformationMessage(INFORMATION_MESSAGE, { modal: false }, ...OPTIONS);

		if (response === OPTIONS[1]) {
			return;
		}

		const apiHelper = new TodoistAPIHelper(context.globalState);

		const success = await apiHelper.closeOpenTask(taskId).catch(() => false);

		if (success) {
			vscode.commands.executeCommand('setContext', 'taskSelected', false);
			syncTodoist();
		} else {
			vscode.window.showErrorMessage("Failed to close task");
		}
	}

	function initTreeView() {
		SettingsHelper.setSelectedTask(context.workspaceState, undefined);

		let lastSyncTime = new Date(SettingsHelper.getTodoistData(context.globalState).lastSyncTime!).getTime();

		if (isNaN(lastSyncTime)) {
			lastSyncTime = new Date(0, 0, 0).getTime();
		}

		const currentTime = new Date().getTime();

		if (currentTime - lastSyncTime > SettingsHelper.getSyncInterval()) {
			syncTodoist();
		}

		vscode.window.registerTreeDataProvider('today', todayTaskViewProvider);
		vscode.window.registerTreeDataProvider('projects', projectsTreeViewProvider);
		vscode.window.registerTreeDataProvider('task', taskTreeViewProvider);

		showWorkspaceProjects();
	}

	function showWorkspaceProjects() {
		if (vscode.workspace.name) {
			let projectId = SettingsHelper.getWorkspaceProject(context.globalState, vscode.workspace.name);
			workspaceProjectTreeViewProvider = new WorkspaceProjectProvider(context.globalState, projectId);
			vscode.window.registerTreeDataProvider('workspaceProject', workspaceProjectTreeViewProvider);
			vscode.window.registerTreeDataProvider('workspaceProjectExt', workspaceProjectTreeViewProvider);
		}
	}

	function syncTodoist() {
		const state = context.globalState;
		const apiHelper = new TodoistAPIHelper(state);
		const projectsTreeViewProvider = new ProjectsProvider(state);
		const todayTaskTreeViewProvider = new TodayTaskProvider(state);

		const progressOptions: vscode.ProgressOptions = {
			location: vscode.ProgressLocation.Notification,
			title: "Syncing with Todoist",
			cancellable: false
		};
		vscode.window.withProgress(progressOptions, (progress, token) => {
			token.onCancellationRequested(() => { });
			progress.report({ message: ' : Projects', increment: 1 });

			return new Promise<void>(resolve => {
				apiHelper.syncProjects().then(() => {
					progress.report({ message: ' : Sections', increment: 33 });
					apiHelper.syncActiveTasks().then(() => {
						progress.report({ message: ' : Tasks', increment: 33 });
						apiHelper.syncSections().then(() => {
							progress.report({ increment: 33, message: "Syncing: Completed" });
							let data = SettingsHelper.getTodoistData(state);
							data.lastSyncTime = new Date();
							SettingsHelper.setTodoistData(state, data);
							vscode.window.registerTreeDataProvider('projects', projectsTreeViewProvider);
							vscode.window.registerTreeDataProvider('today', todayTaskTreeViewProvider);
							showWorkspaceProjects();
							todayTaskTreeViewProvider.refresh();
							projectsTreeViewProvider.refresh(undefined);
							workspaceProjectTreeViewProvider.refresh(undefined);
							if (SettingsHelper.showTaskNotifications()) {
								taskNotifications = NotificationHelper.setupTaskNotifications(context.globalState);
							}
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

	async function attachworkspaceProject() {
		const workspaceName = vscode.workspace.name;

		if (!workspaceName) {
			vscode.window.showErrorMessage("No workspace is open");
			return;
		}

		let projects = SettingsHelper.getTodoistData(context.globalState).projects;

		const selectedProject = await vscode.window.showQuickPick(projects, {
			canPickMany: false,
		});

		if (selectedProject) {
			SettingsHelper.setWorkspaceProject(context.globalState, workspaceName, selectedProject.id);
			showWorkspaceProjects();
			workspaceProjectTreeViewProvider.refresh(undefined);
		}
	}
}

// this method is called when your extension is deactivated
export function deactivate() {
	clearInterval(syncInterval);

	for (let taskNotification of taskNotifications) {
		clearInterval(taskNotification);
	}
}
