import * as vscode from 'vscode';

export default class project implements vscode.QuickPickItem {
    
    label: string = "";
    description?: string | undefined;
    detail?: string | undefined;
    picked?: boolean | undefined;
    alwaysShow?: boolean | undefined;

    id!: Number;
    name!: string;
    color!: Number;
    parent_id!: Number;
    parent!: Number;
    order!: Number;
    comment_count!: Number;
    shared!: Boolean;
    favorite!: Boolean;
    inbox_project!: Boolean;
    team_inbox!: Boolean;
    sync_id!: Number;
    url!: Url;

    public static deserialize(json: any) : project {
        //TODO : Validate before returning
        let proj : project = Object.assign(new project(), json);      
        proj.label = proj.favorite ? '⭐ ' + proj.name : proj.name ;
        proj.alwaysShow = true;
        return proj;
    }
}