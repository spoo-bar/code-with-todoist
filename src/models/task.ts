import { Url } from 'url';

export default class task {

    id!: Number;
    project_id!: Number;
    section_id!: Number;
    content!: string;
    description!: string;
    completed!: Boolean;
    label_ids!: Number[];
    parent_id!: Number;
    parent!: Number;
    order!: Number;
    priority!: Number;
    due!: DueDate;
    url!: Url;
    comment_count!: Number;
    assignee!: Number;
    assigner!: Number;

    public static deserialize(json: any) : task {
        //TODO : Validate before returning
        return Object.assign(new task(), json);        
    }
}

export class DueDate {
    date!: string;
    recurring!: Boolean;
    datetime!: string;
    timezone!: string;
    string!: string;
}

