var snare = new Tone.NoiseSynth({
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

function triggerSynth(time){
	snare.triggerAttackRelease('16n', time)
}

Tone.Transport.schedule(triggerSynth, 0)
Tone.Transport.schedule(triggerSynth, 2 * Tone.Time('8t'))
Tone.Transport.schedule(triggerSynth, Tone.Time('4n') + Tone.Time('8t'))
Tone.Transport.schedule(triggerSynth, Tone.Time('4n') + 2 * Tone.Time('8t'))
Tone.Transport.schedule(triggerSynth, Tone.Time('0:2') + Tone.Time('8t'))
Tone.Transport.schedule(triggerSynth, Tone.Time('0:3') + Tone.Time('8t'))

Tone.Transport.loopEnd = '1m'
Tone.Transport.loop = true
// var snarePart = new Tone.Loop(function(time){
//     snare.triggerAttack(time);
// }, "2n").start("4n");

// snarePart.start();