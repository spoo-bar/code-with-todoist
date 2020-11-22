# code-with-todoist

[![Version](https://vsmarketplacebadge.apphb.com/version/spoorthi.code-with-todoist.svg)](https://marketplace.visualstudio.com/items?itemName=spoorthi.code-with-todoist) [![Installs](https://vsmarketplacebadge.apphb.com/installs-short/spoorthi.code-with-todoist.svg)](https://marketplace.visualstudio.com/items?itemName=spoorthi.code-with-todoist) 

This extension allows you to track your [Todoist](https://todoist.com/) tasks from [vscode](https://code.visualstudio.com/).

## Configuration

Before you can use the extension, you have to set up the following configuration under 

File > Preferences > Settings > Code With Todoist

`code.todoist.api` - To access yor Todoist tasks, you will need to add your Todoist API token. You can get your API token [here](https://todoist.com/prefs/integrations)

`code.todoist.showTodaysTasks` - Enabling this shows today's tasks at the top of the extension sidebar view.

`code.todoist.syncInternval` - Value in milliseconds at which interval Todoist data is synced. 

## Features

### View projects with colour coding

![Screenshot of Todoist projects](media/features/projects.png "Screenshot of Todoist projects")

### View tasks and subtasks under each project and section with its priority

![Screenshot of Todoist tasks](media/features/tasks.PNG "Screenshot of Todoist tasks")

1. Tasks with Priority 1 have red circle before them.
2. Tasks with Priority 2 have orange circle before them.
3. Tasks with Priority 3 have blue circle before them.
4. Tasks with Priority 4 (default) have grey circle before them. 

### View Task details and mark it as done

![Screenshot of individual Todoist task](media/features/task.png "Screenshot of individual Todoist task")

### Show today's tasks

![Screenshot of today's tasks](media/features/today.png "Screenshot of today's tasks")

### Attach Todoist projects to vscode workspaces

![Screenshot of attached projects](media/features/projectworkspace.png "Screenshot of attached projects")

### Offline Support

All Todoist data is cached locally and can be viewed without Internet access.

Todoist Data is synced every 10 minutes by default, but this can be overriden in the Extension Settings.

## Known issues

* Markdown support in Task names - Unsure if vscode extension API supports this.
