# Change Log

All notable changes to the "code-with-todoist" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

### Added
* Added Alphabetical sort option to `code.todoist.sortBy`. Not sure if anyone wants it, but here it is.

### Changed
* Added `Todoist` text to command titles to make it more obvious when accessed from Command Palette. 

### Fixed
* Incorrect error on no task being selected and running `Mark task as done` from Command Palette.

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