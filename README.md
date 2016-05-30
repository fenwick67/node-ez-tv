# Node-EZ-TV
![logo](https://fenwick67.github.io/img/node-ez-tv%20logo.PNG)

This project allows you to set up a simple television station for your home (or school, etc.).  It works with VLC or OMXPlayer.
## Features
* Plays shows based on a schedule you create.
* Plays random "commercials" (files you specify) in-between scheduled shows.
* Serves up a web interface for viewing the schedule and controlling playback.

![web interface screenshot](https://fenwick67.github.io/img/node-ez-tv%20capture.PNG)

# Setup 
## Raspbian
* `sudo apt-get install nodejs-legacy omxplayer npm`
* `sudo npm install -g node-ez-tv`
* run `node-ez-tv [your schedule file]`, or  `node-tv [your schedule file]`

> Linux Protip: use `nohup node-tv [your schedule file] &` to keep it running when the terminal closes

## Other OSes (tested on Windows 10)
* install node/npm
* install vlc (and put it in your PATH)
* `(sudo) npm install -g node-ez-tv`
* run `node-ez-tv [your schedule file]`, or  `node-tv [your schedule file]`

# Creating a Schedule File

See [`schedule.json`](https://github.com/fenwick67/node-ez-tv/blob/master/schedule.json) as an example for a quick start.  Paths are absolute.

## Root elements:

* jobs:(Array)
* commercials:(Array)

## "jobs" format:

Only the `name` and `pathspec` are strictly required.

* `name`:name displayed in the guide (String)
* `pathspec`:the path spec used to find the video file(s) for this show (String) (ex: "/home/pi/videos/*.mkv").  
 * look at the `glob` module docs for more info on formatting
* `cron`: (reccomended) The cron-style scheduling string.  Can be a String or an Array of Strings (ex: "0 20 * * *") for more complex schedules.
 * check out the `cron` module docs for more info on cron format
*  `runtime`:(recommended) the length of the show in minutes (used for the guide but not required)
* `mediaType`: (optional) either `"movie"` or `"show"`.  Used to improve accuracy of OMDB API calls for the guide.
* `repeat`:(optional) if true, repeat episodes end-to-end instead of playing commercials.
* `order`:(optional) set to "random" to shuffle order, A-z otherwise
* `episodeStartIndex`: (optional) The index from which to start playing episodes (int >= 0 or 'random')

## "commercials" format:

* `pathspec`: the path spec used to find the file(s) (String)

# Future Developments
These are ideas.  PRs welcome, have at it!

* Store the last episode played in a series, so if the server restarts, the episode index isn't reset
* Job priority levels for special schedules
* Play web video streams
* Schedule creation tool

# Free TV Content
[Public Domain TV Commercials](https://archive.org/details/classic_tv_commercials)

[Public Domain Movies](https://archive.org/details/SciFi_Horror)

# Why?
Netflix and other streaming services eat up your data and have a limited selection.  There's also nothing good on real TV.

So I created this for my living room to run on a Raspberry Pi and play what I want, all day long.

# License
MIT
