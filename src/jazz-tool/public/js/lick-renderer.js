// TODO: handle triplets in object creation of Stave Note
const lick = [
  [
    { keys: ["d/4"], duration: "q", chord: "Dmin7" },
    { keys: ["f/4"], duration: "q" },
    { keys: ["b/4"], duration: "qr" },
    { keys: ["a/4"], duration: "q" },
  ],
  [
    { keys: ["b/4"], duration: "8", chord: "G7", },
    { keys: ["d/4"], duration: "8" },
    { keys: ["d/4"], accidental: "#", duration: "8" },
    { keys: ["e/4"], duration: "8" },
    { keys: ["f/4"], duration: "8" },
    { keys: ["g/4"], duration: "8" },
    { keys: ["a/4"], duration: "8" },
    { keys: ["b/4"], duration: "8" }
  ],
  [
    { keys: ["c/5"], duration: "8", chord: "Cmaj7", },
    { keys: ["b/4"], duration: "8" },
    { keys: ["g/4"], duration: "8" },
    { keys: ["e/4"], duration: "8" },
    { keys: ["d/4"], duration: "8" },
    { keys: ["c/4"], duration: "8" },
    { keys: ["b/3"], duration: "8" },
    { keys: ["d/4"], duration: "8" }
  ],
];

// https://groups.google.com/forum/#!topic/vexflow/gQ7Zw97Zl6k
VF = Vex.Flow;

const width = 1000;
const height = 300;
var vf = new Vex.Flow.Factory({
  renderer: {elementId: 'boo1', width: width, height: height}
});
var ctx = vf.context;

// Formation annotation for chord symbol
function newAnnotation(text) {
  return new VF.Annotation(text).setFont('Times', 15, 'bold');
}
function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}
const sharp = '#';
const flat = 'B';
const natural = 'n';
const isAccidental = (note) => note.indexOf(sharp) > -1
  || note.indexOf(flat) > -1 || note.indexOf(natural) > -1;
const swapCase = (str) => str.split('').map(c => {
  return c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()
}).join('');

/*
* given a natural pitch with #, i.e. c, return c#
* given a natural pitch with b, i.e. c, return cb
* given a sharp pitch with #, return with double sharp, i.e. c#, return c##
* given a sharp pitch with b, return with natural, i.e. c#, return cn
* given a flat pitch with #, return the natural, i.e. cb, return cn
* given a flat pitch with b, return double flat, i.e. db, return dbb
*/

function applyAccidental(pitch, acc) {
  console.log('applying pitch ' + pitch + 'with accidental' + acc)
  // Given a natural pitch with #, i.e. c, return c#
  if (pitch.length < 2) {
    return pitch + acc;
  }

  // Is a sharp pitch
  if (pitch[1] === sharp) {
    if (acc === sharp) {
      return pitch + sharp;
    } else {
      return pitch[0] + natural;
    }
  }

  // Is a flat pitch
  if (acc === sharp) {
    return pitch[0] + natural;
  }
  return pitch + flat;
}

// Note: Using 'B' as flat to not confuse with the note 'b'
// In real music it is the other way around, but Vex is stupid
// and requires lowercase note names
const C_DISTANCES = {
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

// For printing in dropdown, use object.keys of SCALES and an iterator. C = +0. Db = +1. D = +2.. etc
// const SUPPORTED_KEYS = [ 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const SCALES = {
  'C': ['c','d','e','f','g','a','b'],
  'Db': ['dB','eB','f','gB','aB','bB','c'],
  'D': ['d','e','f#','g','a','b','c#'],
  'Eb': ['eB','f','g','aB','bB','c','d'],
  'E': ['e','f#','g#','a','b','c#','d#'],
  'F': ['f','g','a','bB','c','d','e'],
  'Gb': ['gB','aB','bB','cB','dB','eB','f'],
  'G': ['g','a','b','c','d','e','f#'],
  'Ab': ['aB','bB','c','dB','eB','f','g'],
  'A': ['a','b','c#','d','e','f#','g#'],
  'Bb': ['bB','c','d','eB','f','g','a'],
  'B': ['b','c#','d#','e','f#','g#','a#'],
};

/*
* @param note {string}
* @param fromKey, i.e. 'C'
* @param toKey, i.e. 'Bb'
* return new note
*/
function transposeNoteByKey(note, fromKey, toKey, octave, acc) {
  const degree = SCALES[fromKey].indexOf(note);
  let newPitch = SCALES[toKey][degree];

  // Check octave
  const difference = C_DISTANCES[note] - C_DISTANCES[newPitch];
  let newOctave = octave;
  
  // Transpose down and shift up if the difference between the old key is negative
  if (difference > 0) {
    newOctave++;
  }

  // Apply accidental if requested
  if (acc) {
    newPitch = applyAccidental(newPitch, acc); 
  }
  return newPitch + '/' + newOctave;
}

/*
* @param chord {string} chord name
*/
function updateChord(chord, fromKey, toKey) {
  const note = chord[0];
  const name = chord.substring(1, chord.length);
  const degree = SCALES[fromKey].indexOf(note.toLocaleLowerCase());

  let prefix = SCALES[toKey][degree]; // a note, like c or dB or c#

  // Convert this to actually look like a chord name, i.e. dB => Db and c becomes => C
  // and add the name, i.e. min7
  return swapCase(prefix) + name;
}

/*
  @param lick [Array[Arrays]]
*/
function transposeLickByKey(lick, fromKey, toKey) {
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
        newNote = transposeNoteByKey(pitch, fromKey, toKey, octave, note.accidental);

        // Check for accidental
        console.log("new note is " + newNote);
        if (isAccidental(newNote)) {
          if (note.chord) {
            return {
              ...note,
              keys: [ newNote.substring(0, 1) + newNote.substr(-2) ], // remove accidental
              accidental: newNote.substring(1, newNote.indexOf('/')).toLocaleLowerCase(), // add it here
              chord: updateChord(note.chord, fromKey, toKey),
            };
          }
          return {
            ...note,
            keys: [ newNote.substring(0, 1) + newNote.substr(-2) ], // remove accidental
            accidental: newNote.substring(1, newNote.indexOf('/')).toLocaleLowerCase(), // add it here
          };
        }
        // No accidental
        if (note.chord) {
          return {
            ...note,
            accidental: undefined,
            keys: [ transposeNoteByKey(pitch, fromKey, toKey, octave, note.accidental) ],
            chord: updateChord(note.chord, fromKey, toKey),
         };
        }
        return {
           ...note,
           keys: [ transposeNoteByKey(pitch, fromKey, toKey, octave, note.accidental) ],
        };
      }
      // Rest
      if (note.chord) {
        return {
          ...note,
          chord: updateChord(note.chord, fromKey, toKey),
       };
      }
      return { ... note };
    });
  });
}

const length = 300;
let offsetX = 0;
let n;

// Draw the music given a lick array of measure data
lick.forEach((measure, i) => {

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
