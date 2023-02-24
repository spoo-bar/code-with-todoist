import { ProjectQuickPick } from './project';
import { Section, Task } from '@doist/todoist-api-typescript';

export type TodoistState = {
    lastSyncTime?: Date;
    projects: ProjectQuickPick[];
    tasks: Task[];
    sections: Section[];
};

export const TODOIST_INITIAL_STATE: TodoistState = {
    projects: [],
    tasks: [],
    sections: [],
};
