# code-with-todoist

This extension provides some of the [Todoist](https://todoist.com/) features on vscode.

This extension is still in preview.

## Configuration

To access your Todoist tasks, you will need to add your Todoist API token. 

You can get at your API token at [here](https://todoist.com/prefs/integrations)

The first time you try to access the extension, you will be asked for this token. Without providing this, none of the features of the extension will be available.

In case you need to update your token, you can run the `Update Token` command from the Command Pallatte (`Ctrl+Shift+P`) 

## Features

* View projects
* View tasks
* Mark task as done

![Screenshot of the extension](media/features/view.png "Screenshot of the extension")

## TODO

* When sync fails remove the progress indicator
* Proper error message when sync fails because not connected to internet
* Parse //TODO in code and import to Todoist
* Inline show the imported todos

**Enjoy!**
