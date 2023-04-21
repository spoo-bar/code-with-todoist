import * as vscode from 'vscode';
import SettingsHelper from './settingsHelper';

const MAX_TIMEOUT_VALUE_ADMITTED = 2147483647;
const RESPONSE_OPTIONS = ["Open", "Open In Browser", "Mark as Done", "Ignore"];

export default class NotificationHelper {

    public static setupTaskNotifications(context: vscode.Memento): NodeJS.Timeout[] {
        let taskNotification: NodeJS.Timeout[] = [];
        const tasks = SettingsHelper.getTodoistData(context).tasks;

        for (const task of tasks) {
            if (!task.due?.datetime) {
                continue;
            }

            const time = new Date(task.due.datetime);
            const currentTime = new Date();
            const difference = time.getTime() - currentTime.getTime();

            if (difference <= 0 || difference > MAX_TIMEOUT_VALUE_ADMITTED) {
                continue;
            }


            const interval = setInterval(async () => {
                const message = task.description
                    ? "Task due now : " + task.content + " : " + task.description
                    : "Task due now : " + task.content;

                const res = await vscode.window.showInformationMessage(message, ...RESPONSE_OPTIONS);

                switch (res) {
                    case RESPONSE_OPTIONS[0]:
                        vscode.commands.executeCommand('todoist.openTask', task.id);
                        break;
                    case RESPONSE_OPTIONS[1]:
                        vscode.commands.executeCommand('todoist.openTaskInBrowser', task.url);
                        break;
                    case RESPONSE_OPTIONS[2]:
                        vscode.commands.executeCommand('todoist.closeTask', task);
                        break;
                    default:
                        break;
                }

            }, difference);
            taskNotification.push(interval);
        }
        return taskNotification;
    }

}
