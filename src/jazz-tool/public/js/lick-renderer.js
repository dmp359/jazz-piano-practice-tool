const sharp = '#';
const flat = 'B';
const natural = 'n';

// https://groups.google.com/forum/#!topic/vexflow/gQ7Zw97Zl6k
VF = Vex.Flow;


// Formation annotation for chord symbol
function newAnnotation(text) {
  return new VF.Annotation(text).setFont('Times', 15, 'bold');
}
function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

const isAccidental = (note) => note.indexOf(sharp) > -1
  || note.indexOf(flat) > -1 || note.indexOf(natural) > -1;
const swapCase = (str) => str.split('').map(c => {
  return c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()
}).join('');

/*
* given a natural pitch with #, i.e. c, return c#
* given a natural pitch with b, i.e. c, return cb
* if a natural is specified, just return the pitch
* given a sharp pitch with #, return with double sharp, i.e. c#, return c##
* given a sharp pitch with b, return with natural, i.e. c#, return cn
* given a flat pitch with #, return the natural, i.e. cb, return cn
* given a flat pitch with b, return double flat, i.e. db, return dbb
*/

function applyAccidental(pitch, acc) {
  // Given a natural pitch with no natural accidental specified, return pitch + new acc
  if (pitch.length < 2) {
    return pitch + acc;
  }

  // Given a natural pitch with natural accidental specified, return pitch
  if (acc == natural) {
    return pitch;
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
  'b#': 0,
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

// All major scales, needed for transposition
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
* @param toKey, i.e. 'Bb'
* return new note
*/
function transposeNoteByKey(note, toKey, octave, acc) {
  const degree = SCALES['C'].indexOf(note);
  let newPitch = SCALES[toKey][degree];

  // Check octave
  const difference = C_DISTANCES[note] - C_DISTANCES[newPitch];
  let newOctave = octave;
  
  // Shift octave up if the note is beyond halfway between c and the pitch. Also special case needed for cB
  if (difference > 0 || (difference == -6 && newPitch == 'cB')) {
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
function updateChord(chord, toKey) {
  const note = chord[0];
  const name = chord.substring(1, chord.length);
  const degree = SCALES['C'].indexOf(note.toLocaleLowerCase());

  let prefix = SCALES[toKey][degree]; // a note, like c or dB or c#

  // Convert this to actually look like a chord name, i.e. dB => Db and c becomes => C
  // and add the name, i.e. min7
  return swapCase(prefix) + name;
}

/*
  @param lick [Array[Arrays]]
*/
function transposeLickByKey(lick, toKey) {
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
        newNote = transposeNoteByKey(pitch, toKey, octave, note.accidental);

        // Check for accidental
        if (isAccidental(newNote)) {
          if (note.chord) {
            return {
              ...note,
              keys: [ newNote.substring(0, 1) + newNote.substr(-2) ], // remove accidental
              accidental: newNote.substring(1, newNote.indexOf('/')).toLocaleLowerCase(), // add it here
              chord: updateChord(note.chord, toKey),
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
            keys: [ transposeNoteByKey(pitch, toKey, octave, note.accidental) ],
            chord: updateChord(note.chord, toKey),
         };
        }
        return {
           ...note,
           keys: [ transposeNoteByKey(pitch, toKey, octave, note.accidental) ],
        };
      }
      // Rest
      if (note.chord) {
        return {
          ...note,
          chord: updateChord(note.chord, toKey),
       };
      }
      return { ... note };
    });
  });
}


// Draw the music given a lick array of measure data
function renderLick(lick) {
  const length = 300;
  let offsetX = 0;
  const offsetY = 20;
  let n;

  const width = 1000;
  const height = 200;
  var vf = new Vex.Flow.Factory({
    renderer: { elementId: 'lick', width: width, height: height }
  });
  var ctx = vf.context;
  lick.forEach((measure, i) => {

    // Instantiate stave (measure)
    var staveMeasure = new Vex.Flow.Stave(offsetX, offsetY, length);

    // Draw clef and time signature on first measure
    if (i == 0) {
      staveMeasure.addClef("treble").addTimeSignature("4/4");
    }

    // Draw staff lines
    staveMeasure.setContext(ctx).draw();

    // Create notes from array
    const notesForMeasure = measure.map(note => {
      n = new Vex.Flow.StaveNote(note);

      // If accidental is requested, add it
      if (note.accidental) {
        n.addAccidental(0, new VF.Accidental(note.accidental))
      }

      // If a chord symbol is requested, add it
      if (note.chord) {
        n.addAnnotation(0, newAnnotation(note.chord));
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

  offsetX = 0;
}


// Can't think of an easier way than this. Vex flow doesn't nicely allow re-drawing
function clearStaff() {
  $('#lick').remove();
  const $lickDiv = $('<div>').attr('id', 'lick');
  $lickDiv.insertBefore('#keys');
}


// Render buttons for variable lick
function renderKeyButtons() {
  let $keyButton;
  const SUPPORTED_KEYS = [ 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  SUPPORTED_KEYS.forEach(note => {
    $keyButton = $('<button>').addClass('btn btn-primary').text(note).attr('id', note);
    $keyButton.click(k => {
      clearStaff();
      renderLick(transposeLickByKey(lick, k.target.id));
    });
    $('#keys').append($keyButton);
  });

  let $randomButton = $('<button>').addClass('btn btn-primary').text('Random').attr('id', 'random');
  $randomButton.click(() => {
    clearStaff();
    renderLick(transposeLickByKey(lick, 
      SUPPORTED_KEYS[Math.floor(Math.random() * SUPPORTED_KEYS.length)])
    );
  });
  $('#keys').append($randomButton);
}

// Render lick in C on load
$(document).ready(() => {
  renderLick(lick);
  renderKeyButtons();
});
