# Node-EZ-TV
The advent of the Internet has brought many useful innovations in media.  Streaming services such as Netflix have given us the ability to watch shows whenever we want.  However, you miss out on the full TV Experience!  No commercials, no schedule, too much choice!  This project allows you to set up a simple television station for your home (or even for your community or school) that runs off of local files.

You can get a composite-to-UHF adapter for pretty cheap, so actually wiring this up to your cable jacks and broadcasting on channel 3 throughout your house is pretty simple with a Raspberry Pi.

## Details
Uses VLC, or uses OMXPlayer on Raspberry Pi (when `process.env.USER === 'pi'`).
Plays shows based on a custom schedule you create.  Schedules can be as complex or as simple as you want.
Plays random "commercials" (files you specify) in-between scheduled shows.  
Works on or offline.  

Shows you a simple guide on the local web.  TV show / movie descriptions are loaded from the OMDB API.

## Setup
* Install nodejs and npm, of course
* Install VLC (or install OMXPlayer on raspbian)
 * Make sure VLC is in your PATH
* `$ sudo npm install -g node-ez-tv`
* run `node-ez-tv [your schedule file]` or `node-tv [your schedule file]`

# Schedule Format

See `schedule.json` for an example.  Paths are absolute.

## Root elements:

* jobs:(Array)
* commercials:(Array)
* options:(Object) (unused for now)


## Jobs schema:

* "name":name displayed in the guide (String)
* "cron": can be a String or an Array of strings (ex: "0 20 * * *")
* "pathspec":the path spec used to find filenames (String) (ex: "/home/pi/videos/*.mkv")
* "repeat":(optional) if true, repeat episodes end-to-end
* "runtime":(optional) the length of the show in minutes (used for the guide)
* "order":(optional) set to "random" to shuffle order, A-z otherwise
* "episodeStartIndex": (optional) The index from which to start playing episodes (int >= 0 or 'random')
* "mediaType": (optional) the type of media (may eventually be used for OMDB API)

## Commercials schema:

* "name":(String) (completely unused)
* "pathspec":the path spec used to find the filenames (String)

# Future Developments
These are ideas, PRs welcome!

* Auto-restart on crash
* Store the last episode played in a series, so that when restarting, it doesn't reset the episode index
* On restart, start the video that should be running right now and seek forward into it
* Job priority levels for special schedules
* Admin web interface for modifying schedule, playing videos on-the-fly etc.

# Resources
[Public Domain TV Commercials](https://archive.org/details/classic_tv_commercials)

[Public Domain Movies](https://archive.org/details/SciFi_Horror)

# License
MIT
