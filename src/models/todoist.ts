import project from './project';
import task from './task';
import section from './section';

export class todoist {
    lastSyncTime!: Date;
    projects: project[] = [];
    tasks: task[] = [];
    sections: section[] = [];
}
