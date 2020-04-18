import * as vscode from 'vscode';
import axios from 'axios';
import settingsHelper from './settingsHelper';

export default class todoistAPIHelper {

    public static getProjects(context: vscode.Memento): string | undefined {
        let apiToken = settingsHelper.getTodoistAPIToken(context);
        axios.get('https://api.todoist.com/rest/v1/projects', {
            headers: {
                Authorization: `Bearer ${apiToken}`
            }
        }).then(response => {
            let data = response.data;
            let abcd = '';
            for(let d of data) {
                abcd += d.name + " - ";
            }
            vscode.window.showInformationMessage(abcd);
        }).catch(error => {
            console.log(error);
        });
        return ''
    }


}