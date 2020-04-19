import * as vscode from 'vscode';
import { todoist } from '../models/todoist';

const todoistAPIToken = "todoistAPIToken";
const todoistData = "todoist";
export default class settingsHelper {


    public static getTodoistAPIToken(context: vscode.Memento): string | undefined {
        return context.get<string>(todoistAPIToken);
    }

    public static setTodoistAPIToken(context: vscode.Memento, apiToken: string): void {
        // TODO : validate the token
        context.update(todoistAPIToken, apiToken);
        return;
    }

    public static getTodoistData(context: vscode.Memento): todoist {
        const data = context.get<string>(todoistData);
        if (data) {
            return JSON.parse(data);
        }
        return new todoist();
    }

    public static setTodoistData(context: vscode.Memento, data: todoist): void {
        context.update(todoistData, JSON.stringify(data));
        return;
    }

}