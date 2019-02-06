var snare = new Tone.NoiseSynth({
    "volume" : -5,
    "envelope" : {
        "attack" : 0.001,
        "decay" : 0.2,
        "sustain" : 0
    },
    "filterEnvelope" : {
        "attack" : 0.001,
        "decay" : 0.1,
        "sustain" : 0
    }
}).toMaster();

// create a loop
var loop = new Tone.Loop(time => {
	snare.triggerAttack(time)
}, "4n");

// play the loop
loop.start(0);

//start/stop the transport
document.querySelector('tone-play-toggle').addEventListener('change', e => Tone.Transport.toggle());
document.querySelector('tone-slider').addEventListener('change', e => Tone.Transport.bpm.value = e.detail);
