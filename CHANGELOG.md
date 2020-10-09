# Change Log

All notable changes to the "code-with-todoist" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## Unreleased

### Added

### Changed 

### Removed

### Fixed

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