import { TodoistState } from "./types";

export const TODOIST_INITIAL_STATE: TodoistState = {
    projects: [],
    tasks: [],
    sections: [],
};

export enum CONTEXT_KEYS {
    TODOIST_DATA = "todoistData",
    TODOIST_SELECTED_TASK = "todoistSelectedTask",
}

export enum SORT_BY {
    Order = "Order",
    Priority = "Priority",
    Alphabetical = "Alphabetical"
}
