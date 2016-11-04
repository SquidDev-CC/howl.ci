# [howl.ci](https://squiddev-cc.github.io/howl.ci/)
howl.ci is a project which aims to provide a continuous integration service to ComputerCraft users.

![An example view of the build](/images/Build-View.png)

## Introduction

### So what is this "Continuous Integration" thing anyway?
In this context, continuous integration is a way of automating "building" your code whenever you push a
commit. This could mean checking your code compiles, running a series of tests, or even uploading your finished
build to be distributed to the appreciative public.


### What's in it for me?
Continuous integration is a way of automating a task that you do a lot: testing and releasing code. It gives
you instant feedback of when you (or someone else) has written broken code. howl.ci allows testing against
multiple versions of ComputerCraft, with or without CCTweaks, on normal, advanced or pocket computers.

This of course would take a very long time to do manually, especially if you do it every commit. With
howl.ci you'll have every build result back within a manner of minutes, avalible on an easy to use interface.


### How does it work?
Builds are executed by [Travis](https://travis-ci.org/ "The Travis CI provider")
using a special emulator called the howl.ci runner. This outputs a log file detailing actions taken during
the build. The howl.ci interface then scrapes this log file and extracts useful information such as terminal
output, build status and log messages and displays it to you. You can then step through the build to see
the state at any point.


### Let's see an example then!
The Howl build system uses howl.ci to build itself, ensuring that all code is valid. You can
[view the latest builds](https://squiddev-cc.github.io/howl.ci/?p=travis/builds&repo=SquidDev-CC/Howl)

It is also possible to display log files from arbitrary URLs, such as
[this one](https://squiddev-cc.github.io/howl.ci/?p=url&url=https://gist.githubusercontent.com/SquidDev/b3e88899a86ee73fa2510389b141e9e3/raw/terminal_codes.txt).


### I wanna do this!
We've created a [useful guide](https://squiddev-cc.github.io/howl.ci/docs/getting-started.html) on how to get set up with how.ci.

## More images!
![Playing back the build](/images/Terminal-Control.gif)

![A list of all historic builds](/images/Builds-View.png)
