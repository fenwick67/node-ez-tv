# Node-EZ-TV
The advent of the Internet has brought many useful innovations in media.  Streaming services such as Netflix have given us the ability to watch shows whenever we want.  However, you miss out on the full TV Experience!  No commercials, no schedule, too much choice!  This project allows you to set up a simple television station for your home (or even for your community or school) that runs off of local files.

You can get a composite-to-UHF adapter for pretty cheap, so actually wiring this up to your cable jacks and broadcasting on channel 3 throughout your house is pretty simple with a Raspberry Pi.

##Details
Uses VLC, or automatically uses OMXPlayer on Raspberry Pi.
Plays shows based on a custom schedule you create.  Schedules can be as complex or as simple as you want.
Plays random "commercials" (files you specify) in-between scheduled shows
Works on or offline
Gives you a simple schedule timeline on the local web

## Setup
* Install nodejs, of course
* Install VLC (or install OMXPlayer on raspbian)
* `$ npm install node-ez-tv` to install locally, or `npm install -g node-ez-tv`to install globally
  * *Note:* the VLC library used within requires node-gyp to be in working order to install... but on Raspberry Pi it won't matter because OMXPlayer is used instead, in which case ignore those warnings.
* (optional) set `PORT` environment variable to a port for the web guide interface

# Running the TV Station

## Method 1
* Modify `schedule.json` with your preferred schedule
* run `index.js`

## Method 2
* Create your own schedule JSON file
* run `index.js` with the JSON file as the first command-line parameter:
`node-ez-tv ~/path/to/schedule.json`

# schedule.json Format

See `schedule.json` for an example

##Root elements:

jobs:(Array)
commercials:(Array)
options(Object) (unused)


##Jobs schema:

"name":name displayed in the guide (String)
"cron": can be a String or an Array of strings (ex: "0 20 * * *")
"pathspec":the path spec used to find filenames (String) (ex: "/home/pi/videos/*.mkv")
"repeat":if true, repeat episodes end-to-end
"runtime":the length of the show in minutes (used only for the guide)
"order":"random" shuffles order, A-z otherwise 
"episodeStartIndex":The index from which to start playing episodes (int >= 0 or 'random')

###Commercials schema:

"name":(String) (unused)
"pathspec":the path spec used to find the filenames (String)

#Future Developments
These are ideas, PRs welcome!

* Auto-restart on crash
* Note the last episode played in a series, so that when restarting, it doesn't reset the episode index
* On restart, start the video that should be running right now and seek forward into it
* Job priority levels for special schedules
* Admin web interface for modifying schedule, playing videos on-the-fly etc.

#Resources
[Public Domain TV Commercials](https://archive.org/details/classic_tv_commercials)
[Public Domain Movies](https://archive.org/details/SciFi_Horror)

#License
MIT