# Node-EZ-TV
A TV station for your home, using VLC, or using OMXPlayer on Raspberry Pi.
Plays shows based on a custom schedule you create.  Schedules can be as complex or as simple as you want.
Plays random "commercials" (files you specify) in-between scheduled shows

## Setup
*  Install VLC (or install OMXPlayer on raspbian)
* `$ git clone https://github.com/fenwick67/node-ez-tv.git`
* `$ npm install`
* (optional) set `PORT` environment variable to a port for the web schedule interface

## Running the TV Station
There are two ways to run the TV station.

### Method 1
* Modify `schedule.json` with your preferred schedule
* run `index.js`

### Method 2
* Create your own schedule JSON file
* run `index.js` with the JSON file as the first command-line parameter:
`node-ez-tv ~/path/to/schedule.json`

## Schedule.json format

See `schedule.json` for an example

###Root elements:

jobs:(Array)
commercials:(Array)
options(Object) (not used)


###Jobs schema:

"name":name displayed in the guide (String)
"cron":cron can be a String or an Array of strings (ex: "0 20 * * *")
"pathspec":the path spec used to find filenames (String) (ex: "/home/pi/videos/*.mkv")
"repeat":if true, repeat episodes end-to-end
"runtime":the length of the show in minutes (used only in the guide)
"order":"random" shuffles order, A-z otherwise 
"episodeStartIndex":The index from which to start playing episodes (int >= 0 or 'random')



###Commercials schema:

"name":(not actually used)
"pathspec":the path spec used to find the filenames (String)


##Future Developments
These are ideas, PRs welcome!

* Auto-restart on crash
* Record the last episode played in a series so that when restarting the program it doesn't re-play all episodes in the same order again
* On restart, start the video that should be running right now and 
* Job priority levels (for example: have a normal daily schedule except on Christmas, just play my Christmas movies)
* Admin web interface for modifying schedule, skipping episodes, etc