import * as vscode from 'vscode';
import settingsHelper from './settingsHelper';

export default class notificationHelper {

    public static setupTaskNotifications(context: vscode.Memento): NodeJS.Timeout[] {
        let taskNotification: NodeJS.Timeout[] = [];
        let tasks = settingsHelper.getTodoistData(context).tasks;
        for (const task of tasks) {
            if (task.due && task.due.datetime) {
                const time = new Date(task.due.datetime);
                const currentTime = new Date();
                const difference = time.getTime() - currentTime.getTime();

                if (difference > 0) {
                    const interval = setInterval(function () {
                        let message = "Task due now : " + task.content;
                    if(task.description) {
                        message += " : " + task.description;
                    }
                    vscode.window.showInformationMessage(message, "Mark as Done", "Open", "Open In Browser", "Ignore").then(res => {
                        
                        switch(res) {
                            case "Open":
                              vscode.commands.executeCommand('todoist.openTask', task.id);
                              break;
                            case "Open In Browser":
                                vscode.commands.executeCommand('todoist.openTaskInBrowser', task.url);
                              break;
                            case "Mark as Done":
                                vscode.commands.executeCommand('todoist.closeTask', task);
                                break;
                            default:
                          }
                    });
                    }, difference);
                    taskNotification.push(interval);
                }

            }
        }
        return taskNotification;
    }

}