# Change Log

All notable changes to the "code-with-todoist" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [2.0.0] - 2023-04-21

> **Note**
>
> This release is a breaking change. You will have to set your Todoist API token again using the `todoist.setApiToken` command. The prior value set in Extension settings is not used anymore

Thanks to [dubisdev](https://github.com/dubisdev) for all contributions to this release 🚀

### Changed
* Replace Axios with with the official todoist client `@doist/todoist-api-typescript`

### Security
* Deprecated the `apiToken` setting in the Extension settings. The todoist api token is now configured via the `todoist.setApiToken` command which stores the api token in [SecretStorage](https://code.visualstudio.com/api/references/vscode-api#SecretStorage). 

### Fixed
* Memory leak in setting notifications for upcoming tasks 

## [1.1.1] - 2022-12-21 

### Fixed
* Issue with extension package upload for README with svg links


## [1.1.0] - 2022-12-21 

### Added
* Three new configurations related to overdue tasks display.
* Tooltips for tasks render markdown strings

### Changed
* Display order of configurations in the settings.
* Show `Sync Todoist` command on all views on the extension sidebar. Except `Task` view. Earlier, the command icon was shown only on Projects view.

### Deprecated
* Support for vscode before `1.62.0` removed.

### Fixed
* Migrating Todoist endpoint API from v1 to v2. Thanks to [@epicbananana](https://github.com/epicbananana)


## [1.0.0] - 2021-09-21

### Added
* Added Alphabetical sort option to `code.todoist.sortBy`. Not sure if anyone wants it, but here it is.
* With `code.todoist.showTaskNotifications` enabled, get notifications within vscode for tasks for which time is set.

### Changed
* Added `Todoist` text to command titles to make it more obvious when accessed from Command Palette. 
* Changed the identifiers for the extention settings. **Prior settings are not carried over and need to be reset**

### Fixed
* Incorrect error on no task being selected and running `Mark task as done` from Command Palette.
* [#25](https://github.com/spoon611/code-with-todoist/issues/25) - Removed task and project properties which were marked deprecated by todoist

## [0.5.2] - 2021-08-06

### Added
* [#19](https://github.com/spoon611/code-with-todoist/issues/19) - Added a setting `code.todoist.sortBy` to be able to choose how the Todoist tasks should be sorted in the task views. The two options are to
    1. Retain Todoist task ordering
    2. Sort based on task priority
* [#23](https://github.com/spoon611/code-with-todoist/issues/23) - Added ability to create new tasks from the extension. Task is associated with the selected worksapce project or inbox if not.

## [0.5.1] - 2021-01-20

### Added
* Support for older vscode version. Now supports 1.44 onwards

## [0.5.0] - 2020-11-22

### Added
* Mark task as done from Today view
* Show different icon for shared projects
* Attach Todoist projects to vscode workspaces


## [0.4.3] - 2020-10-09

### Fixed
* [#15](https://github.com/spoon611/code-with-todoist/issues/15) - Command 'todoist.sync' not found 

### Removed
* Create new project functionality

## [0.4.2] - 2020-10-02

### Fixed
* Fixed publish error in README.md 

## [0.4.1] - 2020-10-02

### Added
* Configuration - Control how often syncing of Todoist projects/tasks occurs
* Detailed message on what is being synced


## [0.4.0] - 2020-09-30

### Added
* Show today's tasks at the top of the sideview
* Show priority bubbles for tasks

### Fixed
* Hide completed subtasks Thanks to [@corderop](https://github.com/corderop)
* Fixed incorrect ordering of tasks under sections 

## [0.3.0] - 2020-09-23

### Added
* Adding support for [Sections](https://get.todoist.help/hc/en-us/articles/360003788739-Sections)
* Create new Project (only parent Projects currently supported)

### Fixed
* Fixed ordering of tasks and subtasks being incorrect

## [0.2.1] - 2020-07-27

### Fixed
* Fixing bug where auto sync was not happening on extension load

## [0.2.0] - 2020-07-24

### Changed 
* Allowing subtasks to be collapsed. Thanks to [@deitry](https://github.com/deitry)

## [0.1.2] - 2020-04-24

### Added
* Proper error messages on sync failing

### Changed
* Todoist API token saved in extension configuration instead of state. 

### Removed
* Todoist API token prompt on extension load

### Fixed
* Progress notification stuck when Sync failed


## [0.1.1] - 2020-04-23 

### Added
* View projects
* View tasks
* Mark task as done