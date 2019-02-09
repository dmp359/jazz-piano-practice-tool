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

// TODO: Transpose function
const lick = [
  [
    { keys: ["c/4"], duration: "q", chord: "Dmin7" },
    { keys: ["d/4"], duration: "q" },
    { keys: ["b/4"], duration: "qr" },
    { keys: ["b/4"], duration: "q" },
  ],
  [
    { keys: ["c/4"], duration: "8", chord: "G7", },
    { keys: ["d/4"], duration: "8" },
    { keys: ["b/4"], duration: "8" },
    { keys: ["c/4", "e/4", "g/4"], duration: "8" },
    { keys: ["c/4"], duration: "8" },
    { keys: ["d/4"], duration: "8" },
    { keys: ["b/4"], duration: "8" },
    { keys: ["c/4", "e/4", "g/4"], duration: "8" }
  ],
]
const length = 300;
let offsetX = 0;

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
    // If a chord symbol is requested, add it
    if (note.chord) {
      return new Vex.Flow.StaveNote(note).addAnnotation(0, newAnnotation(note.chord));
    }
    return new Vex.Flow.StaveNote(note);
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
