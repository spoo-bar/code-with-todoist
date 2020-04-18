import * as vscode from 'vscode';

const todoistAPIToken = "todoistAPIToken";
export default class settingsHelper {


    public static getTodoistAPIToken(context: vscode.Memento): string | undefined {
        let todoistAPIToken = context.get<string>("todoistAPIToken");
        return todoistAPIToken;
    }

    public static setTodoistAPIToken(context: vscode.Memento, apiToken: string): void {
        // TODO : validate the token
        context.update(todoistAPIToken, apiToken);
        return;
    }

}