import * as vscode from 'vscode';

export default class project {

    id!: Number;
    name!: string;
    color!: Number;
    parent!: Number;
    order!: Number;
    comment_count!: Number;
    shared!: Boolean;
    inbox_project!: Boolean;
    team_inbox!: Boolean;

    public static deserialize(json: any) : project {
        //TODO : Validate before returning
        return Object.assign(new project(), json);        
    }
}