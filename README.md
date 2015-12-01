# PIE-ANO

A simple piano-ish fluty synth thing, for use in browserified web audio applications.

## WIKI

`npm install pie-ano`

## USE
```
window.AudioContext = window.AudioContext || window.webkitAudioContext
var ac = new AudioContext()
var pie = require('pie-ano')(ac)
pie.connect(ac.destination)

// set the frequency/ADSR
pie.update({midiNote: 72, attack: 0.3, decay: 0.1, sustain: 0.3, release: 0.5})
// and trigger it!
pie.start(ac.currentTime)


// destroy the oscillators completely. u probably would only wanna do this for garbage collection porpoises.
pie.stop(ac.currentTime)


// this will return an object containing all the nodes in the pie-ano audioGraph, for closer-to-the-metal manipulation than the update/start methods provide.
pie.nodes() 
```

# DEVELOPMENT

```
npm install
npm run test # should pass! Yay!
```

# HEAR THE MAGIC!

- `npm run serve` boot a webserver at port 3000
- `npm run build` build demo.js to a bundle. Run this after making any changes to hear updates (or add [watchify](https://github.com/wham-js/web-audio-advent-calendar/blob/master/package.json#L8), i wanted to keep things "light")
- open `http://localhost:3000/` in a web browser and hear the magic (hopefully)

# RESOURCES


- [openmusic](https://github.com/openmusic) has a ton of helpful modules
- if you need a basic convolver impulse, [voila](https://github.com/mdn/voice-change-o-matic/tree/gh-pages/audio)