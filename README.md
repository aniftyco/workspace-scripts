# @aniftyco/workspace-scripts

> CLI scripts to help manage things in NiftyCo workspaces

### Runner

This is a little script that wraps `concurrently` to allow us to execute in paralell scripts for all workspaces. So if
you do `runner dev` then it will execute `dev` script in all of your `package.json#workspaces`.
