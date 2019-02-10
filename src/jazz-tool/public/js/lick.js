// https://groups.google.com/forum/#!topic/vexflow/gQ7Zw97Zl6k
VF = Vex.Flow;

const width = 1000;
const height = 250;
var vf = new Vex.Flow.Factory({
  renderer: {elementId: 'boo', width: width, height: height}
});

var ctx = vf.context;

// Formation annotation for chord symbol
function newAnnotation(text) {
  return new VF.Annotation(text).setFont('Times', 14, 'bold');
}
function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

// Note: Using 'B' as flat to not confuse with the note 'b'
// In real music it is the other way around, but Vex is stupid
// and requires lowercase note names
const NOTE_TO_VALUES = {
  'c': 0,
  'c#': 1,
  'dB': 1,
  'd': 2,
  'd#': 3,
  'eB': 3,
  'e': 4,
  'f': 5,
  'f#': 6,
  'gB': 6,
  'g' : 7,
  'g#': 8,
  'aB': 8,
  'a': 9,
  'a#': 10,
  'bB': 10,
  'b': 11,
  'cB': 11,
};

// For printing in dropdown. C = +0. Db = +1. D = +2.. etc
const SUPPORTED_KEYS = [ 'C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
 
/*
* @param note {string}
* @param amount {number}
* Transpose a note, i.e. C in octave 4, by a certain amount, i.e. 2 shoud return D in octave 4
* Handle octave jumping, i.e. B in octave 4 up one should go up to C in octave 5
* TODO: this may have to be smarter
*/
function transposeNoteByAmount(note, amount, octave) {
  const currentValue = NOTE_TO_VALUES[note];
  const newValue = (currentValue + amount) % 12;
  let newOctave = octave;

  // An octave change occured
  if (currentValue + amount >= 12) {
    newOctave++;
  }
  return (getKeyByValue(NOTE_TO_VALUES, newValue) + '/' + newOctave);
}

/*
  @param lick [Array[Arrays]]
*/
function transposeLick(lick, amount) {
  // Loop over all measures
  // Move each note to new key
  // Return new lick
  let idx, pitch, octave, newNote;
  return lick.map(bar => {
    return bar.map(note => {

      // If note object is a pitch
      if (!note.duration.includes('r')) {
        idx = note.keys.indexOf('/') - 1;
        pitch = note.keys[0].slice(0, idx); // parse keys object for the note, i.e. 'c' in ['c/4']
        octave = note.keys[0].slice(idx + 1, note.keys[0].length); // "" "" .. i.e. '4' in ['c/4']
        newNote = transposeNoteByAmount(pitch, amount, octave);
        // Check for accidental
        console.log("new note is " + newNote);
        if (newNote.indexOf('#') > -1 || newNote.indexOf('B') > -1) {
          return {
            ...note,
            keys: [ newNote.substring(0, 1) + newNote.substr(-2) ], // remove accidental
            accidental: newNote.substring(1, 2).toLocaleLowerCase(), // add it here
         };
        }
        // No accidental
        return {
           ...note,
           keys: [ transposeNoteByAmount(pitch, amount, octave) ],
        };
      }
      // Rest
      return { ... note };
    });
  });
}

// TODO: handle triplets
const lick = [
  [
    { keys: ["c/4"], duration: "q", chord: "Dmin7" },
    { keys: ["d/4"], duration: "q" },
    { keys: ["b/4"], duration: "qr" },
    { keys: ["e/4"], duration: "q" },
  ],
  [
    { keys: ["b/4"], duration: "8", chord: "G7", },
    { keys: ["d/4"], duration: "8" },
    { keys: ["b/4"], duration: "8" },
    { keys: ["c/4"], duration: "8" },
    { keys: ["c/4"], duration: "8" },
    { keys: ["d/4"], duration: "8" },
    { keys: ["b/4"], duration: "8" },
    { keys: ["c/4"], duration: "8" }
  ],
  [
    { keys: ["c/4"], duration: "8", chord: "Cmaj7", },
    { keys: ["d/4"], duration: "8" },
    { keys: ["b/4"], duration: "8" },
    { keys: ["c/4"], duration: "8" },
    { keys: ["c/4"], duration: "8" },
    { keys: ["d/4"], duration: "8" },
    { keys: ["b/4"], duration: "8" },
    { keys: ["c/4"], duration: "8" }
  ],
];

const length = 300;
let offsetX = 0;

// Draw the music given a lick array of measure data
const newLick = transposeLick(lick, 5);
let n;
newLick.forEach((measure, i) => {

  // Instantiate stave (measure)
  var staveMeasure = new Vex.Flow.Stave(offsetX, 0, length);

   // Draw clef and time signature on first measure
  if (i == 0) {
    staveMeasure.addClef("treble").addTimeSignature("4/4");
  }

  // Draw staff lines
  staveMeasure.setContext(ctx).draw();

  // Create notes from array
  var notesForMeasure = measure.map(note => {
    console.log(note.keys);
    n = new Vex.Flow.StaveNote(note);

    // If a chord symbol is requested, add it
    if (note.chord) {
      n.addAnnotation(0, newAnnotation(note.chord));
    }
    // If accidental is requested, add it
    if (note.accidental) {
      n.addAccidental(0, new VF.Accidental(note.accidental))
    }
    return n;
  });

  // Automatic beaming
  var beams = VF.Beam.generateBeams(notesForMeasure);
  var voice = new Vex.Flow.Voice(Vex.Flow.TIME4_4);
  voice.addTickables(notesForMeasure);
  var formatter = new Vex.Flow.Formatter();
  formatter.joinVoices([voice]).formatToStave([voice], staveMeasure);
  voice.draw(ctx, staveMeasure);
  beams.forEach(function(beam) {
    beam.setContext(ctx).draw();
  });

  // Helper function to justify and draw a 4/4 voice
  Vex.Flow.Formatter.FormatAndDraw(ctx, staveMeasure, notesForMeasure);
  
  // Juxtapose next measure next to previous measure
  offsetX += staveMeasure.width;
});
