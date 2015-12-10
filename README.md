# Node-EZ-TV
This project allows you to set up a simple television station for your home (or school, etc.).  It works with VLC or OMXPlayer.
## Features
* Plays shows based on a custom schedule you create.  
* Plays random "commercials" (files you specify) in-between scheduled shows.   
* Serves up a simple guide on the network.  Show / movie descriptions are loaded to the client from the OMDB API.  It looks like this:

![web interface screenshot](https://fenwick67.github.io/img/node-ez-tv%20capture.PNG)

## Setup
* Install nodejs and npm
* Install VLC (or install OMXPlayer on raspbian)
 * Make sure VLC is in your PATH

* `sudo npm install -g node-ez-tv`
* run `node-ez-tv [your schedule file]`, or  `node-tv [your schedule file]`

# Creating a Schedule File

See `schedule.json` as an example for a quick start.  Paths are absolute.

## Root elements:

* jobs:(Array)
* commercials:(Array)
* options:(Object) (unused for now)


## "jobs" format:

* `name`:name displayed in the guide (String)
* `cron` The cron-style scheduling string.  Can be a String or an Array of Strings (ex: "0 20 * * *") for more complex schedules.
 * check out the `cron` module docs for more info on cron format

* `pathspec`:the path spec used to find the video file(s) (String) (ex: "/home/pi/videos/*.mkv").  
 * look at the `glob` module docs for more info on formatting
*  `runtime`:(recommended) the length of the show in minutes (used for the guide but not strictly required)
* `mediaType`: (optional) either `"movie"` or `"show"`.  Used to improve accuracy of OMDB API calls for the guide.
* `repeat`:(optional) if true, repeat episodes end-to-end instead of playing commercials.
* `order`:(optional) set to "random" to shuffle order, A-z otherwise
* `episodeStartIndex`: (optional) The index from which to start playing episodes (int >= 0 or 'random')
* `mediaType`: (optional) the type of media (may eventually be used for OMDB API)

## "commercials" format:

* `pathspec`: the path spec used to find the file(s) (String) 
* `name`:(unused for now)

# Future Developments
These are ideas.  PRs welcome, have at it!

* Auto-restart on crash
* Store the last episode played in a series, so that when restarting, the episode index isn't reset
* Job priority levels for special schedules
* Admin web interface for modifying schedule, playing videos on-the-fly, marathons, etc.
* Play web video streams
* Schedule creation tool

# TV Content
[Public Domain TV Commercials](https://archive.org/details/classic_tv_commercials)

[Public Domain Movies](https://archive.org/details/SciFi_Horror)

# Why?
Netflix and other streaming services eat up your data and have a limited selection.  There's also nothing good on real TV.

So I created this for my living room to run on a Raspberry Pi and play what I want, all day long.
# License
MIT
