// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import settingsHelper from './helpers/settingsHelper';
import { projectsProvider } from './features/projectsProvider';
import todoistAPIHelper from './helpers/todoistAPIHelper';
import { taskProvider } from './features/taskProvider';
import task from './models/task';
import { todosProvider } from './features/todosProvider';
import { todayTaskProvider } from './features/todayTaskProvider';
import { workspaceProjectProvider } from './features/workspaceProjectProvider';
import { todoist } from './models/todoist';
import notificationHelper from './helpers/notificationHelper';

let syncInterval!: NodeJS.Timeout;
let taskNotifications!: NodeJS.Timeout[];
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// On Extension Activation Validating Token -----------------------------------------
	const apiToken = settingsHelper.getTodoistAPIToken();
	const projectsTreeViewProvider = new projectsProvider(context.globalState);
	const taskTreeViewProvider = new taskProvider(context);
	const todayTaskViewProvider = new todayTaskProvider(context.globalState);
	let workspaceProjectTreeViewProvider: workspaceProjectProvider;
	let todoViewProvider: todosProvider;

	if (!apiToken) {
		vscode.window.showErrorMessage("Todoist API token not found. Set it under File > Preferences > Settings > Code With Todoist");
	}
	else {
		syncInterval = setInterval(syncTodoist, settingsHelper.getSyncInterval());
		initTreeView();
	}

	if (settingsHelper.showTodaysTasks()) {
		vscode.commands.executeCommand('setContext', 'showTodaysTasks', true);
	}

	if (settingsHelper.showTaskNotifications()) {
		taskNotifications = notificationHelper.setupTaskNotifications(context.globalState);
	}

	if (settingsHelper.showWorkspaceTodos()) {
		var regex = settingsHelper.getTodosRegEx();
		if (!regex) {
			vscode.window.showErrorMessage("RegEx value to identify Todos in the project is not set. Set it under File > Preferences > Settings > Code With Todoist");
		}
		else {
			if (vscode.workspace.name) {
				let projectId = settingsHelper.getWorkspaceProject(context.globalState, vscode.workspace.name);
				todoViewProvider = new todosProvider(context.globalState, projectId);
				vscode.window.registerTreeDataProvider('todos', todoViewProvider);
			}
			
		}
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
		if (task) {
			closeSelectedTask(task);
		}
		else {
			vscode.window.showErrorMessage("No task was selected. Select a task from the sidebar.")
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('todoist.openCustomTask', (filePath: vscode.Uri, line: number, column: number) => {
		openCustomTask(filePath, line, column);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('todoist.attachproject', () => {
		if (vscode.workspace.name) {
			let workspaceName = vscode.workspace.name;
			var projectId = settingsHelper.getWorkspaceProject(context.globalState, workspaceName);
			if (projectId == 0) {
				attachworkspaceProject();
			}
			else {
				vscode.window.showInformationMessage("There is already a project attached to this workspace. Do you want to overwrite it?", {
					modal: false
				}, 'Yes', 'No').then(response => {
					if (response == 'Yes') {
						attachworkspaceProject();
					}
				});
			}
		}
		else {
			vscode.window.showErrorMessage("You have not yet opened a folder. Open a folder and retry.");
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

	context.subscriptions.push(vscode.commands.registerCommand('todoist.createTask', () => {
		let projectName = "Inbox";
		let workspaceProjectId = 0;
		if (vscode.workspace.name) {
			workspaceProjectId = settingsHelper.getWorkspaceProject(context.globalState, vscode.workspace.name);
			if (workspaceProjectId != 0) {
				let projects = settingsHelper.getTodoistData(context.globalState).projects;
				projectName = projects.filter(p => p.id == workspaceProjectId)[0].name;
			}
		}

		vscode.window.showInputBox({
			prompt: "Creating task under project : " + projectName,

		}).then(taskName => {
			if (taskName) {

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
						const apiHelper = new todoistAPIHelper(state);
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

			}
		})
	}))

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
		if (isNaN(lastSyncTime)) {
			lastSyncTime = new Date(0, 0, 0).getTime();
		}
		const currentTime = new Date().getTime();
		if (currentTime - lastSyncTime > settingsHelper.getSyncInterval()) { // 10 minutes
			syncTodoist();
		}

		vscode.window.registerTreeDataProvider('today', todayTaskViewProvider);
		vscode.window.registerTreeDataProvider('projects', projectsTreeViewProvider);
		vscode.window.registerTreeDataProvider('task', taskTreeViewProvider);

		showWorkspaceProjects();
	}

	function showWorkspaceProjects() {
		if (vscode.workspace.name) {
			let projectId = settingsHelper.getWorkspaceProject(context.globalState, vscode.workspace.name);
			workspaceProjectTreeViewProvider = new workspaceProjectProvider(context.globalState, projectId);
			vscode.window.registerTreeDataProvider('workspaceProject', workspaceProjectTreeViewProvider);
			vscode.window.registerTreeDataProvider('workspaceProjectExt', workspaceProjectTreeViewProvider);
		}
	}

	function syncTodoist() {
		const state = context.globalState;
		const apiHelper = new todoistAPIHelper(state);
		const projectsTreeViewProvider = new projectsProvider(state);
		const todayTaskTreeViewProvider = new todayTaskProvider(state);

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
							let data = settingsHelper.getTodoistData(state);
							data.lastSyncTime = new Date();
							settingsHelper.setTodoistData(state, data);
							vscode.window.registerTreeDataProvider('projects', projectsTreeViewProvider);
							vscode.window.registerTreeDataProvider('today', todayTaskTreeViewProvider);
							showWorkspaceProjects();
							todayTaskTreeViewProvider.refresh();
							projectsTreeViewProvider.refresh();
							workspaceProjectTreeViewProvider.refresh();
							if (settingsHelper.showTaskNotifications()) {
								taskNotifications = notificationHelper.setupTaskNotifications(context.globalState);
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

	function attachworkspaceProject() {
		let workspaceName = vscode.workspace.name;
		let projects = settingsHelper.getTodoistData(context.globalState).projects;
		vscode.window.showQuickPick(projects, {
			canPickMany: false,
		}).then(selectedProject => {
			if (selectedProject) {
				settingsHelper.setWorkspaceProject(context.globalState, workspaceName!, selectedProject.id);
				showWorkspaceProjects();
				workspaceProjectTreeViewProvider.refresh();
			}
		});
	}
}

// this method is called when your extension is deactivated
export function deactivate() {
	clearInterval(syncInterval);

	for (let taskNotification of taskNotifications) {
		clearInterval(taskNotification);
	}
}
