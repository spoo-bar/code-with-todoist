import { Url } from 'url';

function strikeThroughContent(text: string) {
    return text
        .split('')
        .map( ( char: string ) => char + '\u0336')
        .join('')
}

export default class task {

    id!: Number;
    project_id!: Number;
    section_id!: Number;
    content!: string;
    completed!: Boolean;
    label_ids!: Number[];
    parent!: Number;
    order!: Number;
    priority!: Number;
    due!: DueDate;
    url!: Url;
    comment_count!: Number;

    public static deserialize(json: any) : task {

        // Completed subtasks cross out
        if(json.completed)
            json.content = strikeThroughContent(json.content);
            
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

