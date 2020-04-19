import * as vscode from 'vscode';

export default class section {

    id!: Number;
    project_id !: Number;
    order !: Number;
    name !: string;

    public static deserialize(json: any) : section {
        //TODO : Validate before returning
        return Object.assign(new section(), json);        
    }
}