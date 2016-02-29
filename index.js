var makeDistortionCurve = require('make-distortion-curve')
var MIDIUtils = require('midiutils')
var adsr = require('a-d-s-r')

// yr function should accept an audioContext, and optional params/opts
module.exports = function (ac, opts) {
  // make some audioNodes, connect them, store them on the object
  var audioNodes = {}

  var osc1 = ac.createOscillator()
  var osc2 = ac.createOscillator()
  var osc3 = ac.createOscillator()
  var oscnoise = ac.createOscillator()
  osc1.type = 'triangle'
  osc2.type = 'triangle'
  osc3.type = 'sine'
  oscnoise.type = 'sawtooth'

  // are these tooooo small?
  osc1.detune.value = 0.75 * ((Math.random() * 2) - 1)
  osc2.detune.value = 0.75 * ((Math.random() * 2) - 1)
  osc3.detune.value = 0.3 * ((Math.random() * 2) - 1)

  var leftfilter = ac.createBiquadFilter()
  leftfilter.type = 'lowpass'
  leftfilter.Q.value = 7
  leftfilter.detune.value = 0.75 * ((Math.random() * 2) - 1)
  leftfilter.frequency.setValueAtTime(500, ac.currentTime)

  var rightfilter = ac.createBiquadFilter()
  rightfilter.type = 'lowpass'
  rightfilter.Q.value = 7
  rightfilter.detune.value = 0.75 * ((Math.random() * 2) - 1)
  rightfilter.frequency.setValueAtTime(500, ac.currentTime)


  var noisegain = ac.createGain()
  noisegain.gain.setValueAtTime(0, ac.currentTime)

  var delay = ac.createDelay(0.35)

  var compressor = ac.createDynamicsCompressor()
  compressor.threshold.value = -30
  compressor.knee.value = 33
  compressor.ratio.value = 9
  compressor.reduction.value = -10
  compressor.attack.value = 0.15
  compressor.release.value = 0.35

  var gain = ac.createGain()
  gain.gain.setValueAtTime(0, ac.currentTime)


  var distortion = ac.createWaveShaper()
  distortion.curve = makeDistortionCurve(75)

  var mainfilter = ac.createBiquadFilter()
  mainfilter.type = 'lowpass'
  mainfilter.frequency.setValueAtTime(500, ac.currentTime)

  oscnoise.connect(noisegain)
  osc1.connect(leftfilter)
  osc2.connect(rightfilter)
  leftfilter.connect(compressor)
  rightfilter.connect(compressor)
  osc3.connect(compressor)
  noisegain.connect(delay)
  noisegain.connect(distortion)
  delay.connect(compressor)
  compressor.connect(gain)
  gain.connect(distortion)
  distortion.connect(mainfilter)

  // gotta be a better way to do this... oh well
  audioNodes.oscnoise = oscnoise
  audioNodes.noisegain = noisegain
  audioNodes.osc1 = osc1
  audioNodes.osc2 = osc2
  audioNodes.osc3 = osc3
  audioNodes.leftfilter = leftfilter
  audioNodes.rightfilter = rightfilter
  audioNodes.mainfilter = mainfilter
  audioNodes.gain = gain
  audioNodes.delay = delay
  audioNodes.distortion = distortion
  audioNodes.compressor = compressor

  // gosh i wish there was an audioNode that just did this...
  audioNodes.settings = {
    attack: 0.1,
    decay: 0.05,
    sustain: 0.3,
    release: 0.1,
    peak: 0.5,
    mid: 0.3,
    end: 0.000001
  }

  return {
    connect: function (input) {
      // // this function should call `connect` on yr output nodes with `input` as the arg
      audioNodes.mainfilter.connect(input)

      // just let them buzz forever, deal with "notes" via adsr tricks
      audioNodes.oscnoise.start(ac.currentTime)
      audioNodes.osc1.start(ac.currentTime)
      audioNodes.osc2.start(ac.currentTime)
      audioNodes.osc3.start(ac.currentTime)
    },
    start: function (when) {
      // console.log('start', audioNodes.settings)

      adsr(audioNodes.gain, when, audioNodes.settings)
      // console.log('one')
      var cloned = JSON.parse(JSON.stringify(audioNodes.settings))
      cloned.peak /= 2.0
      cloned.mid /= 2.0
      // console.log('didit', cloned)
      adsr(audioNodes.noisegain, when, cloned)
    },
    stop: function (when) {
      audioNodes.oscnoise.stop(when)
      audioNodes.osc1.stop(when)
      audioNodes.osc2.stop(when)
      audioNodes.osc3.stop(when)
      console.log('whyd u push the piano off the building? not it is broken, forever. gotta make a new one!')
    },
    update: function (opts, when) {
      // available opts:
      // {midiNote: 62, attack: , decay: , sustain: , release: }
      Object.keys(opts).forEach(function (k) {
        var v = opts[k]
        if (k == 'midiNote' || k == 'freq') {
          var freq = k == 'midiNote' ? MIDIUtils.noteNumberToFrequency(v) : v
          audioNodes.leftfilter.frequency.setValueAtTime(freq + (Math.random() * (freq / 2.5)), when)
          audioNodes.rightfilter.frequency.setValueAtTime(freq + (Math.random() * (freq / 2.5)), when)
          audioNodes.mainfilter.frequency.setValueAtTime(freq + (Math.random() * (freq / 3.5)), when)
          audioNodes.oscnoise.frequency.setValueAtTime(freq, when)
          audioNodes.osc1.frequency.setValueAtTime(freq, when)
          audioNodes.osc2.frequency.setValueAtTime(freq, when)
          audioNodes.osc3.frequency.setValueAtTime(freq / 2.0, when)
        } else {
          // just an ADSR value
          audioNodes.settings[k] = v
        }
      })
    },
    nodes: function () {
      // returns an object of `{stringKey: audioNode}` for raw manipulation
      return audioNodes
    }
  }
}