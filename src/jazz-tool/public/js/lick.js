// https://groups.google.com/forum/#!topic/vexflow/gQ7Zw97Zl6k
VF = Vex.Flow;

// // Automatic beaming
// var beams = VF.Beam.generateBeams(notes);
// voice.draw(context, stave);
// beams.forEach(function(beam) {
//   beam.setContext(context).draw();
// });
const width = 1000;
const height = 250;
var vf = new Vex.Flow.Factory({
  renderer: {elementId: 'boo', width: width, height: height}
});

var ctx = vf.context;

// measure 1
var length = 300;
var staveMeasure1 = new Vex.Flow.Stave(10, 0, length);
staveMeasure1.addClef("treble").addTimeSignature("4/4").setContext(ctx).draw();

var notesMeasure1 = [
  new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q" }),
  new Vex.Flow.StaveNote({ keys: ["d/4"], duration: "q" }),
  new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "qr" }),
  new Vex.Flow.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" })
];

// Helper function to justify and draw a 4/4 voice
Vex.Flow.Formatter.FormatAndDraw(ctx, staveMeasure1, notesMeasure1);

// measure 2 - juxtaposing second measure next to first measure
var staveMeasure2 = new Vex.Flow.Stave(staveMeasure1.width + staveMeasure1.x, 0, length);
staveMeasure2.setContext(ctx).draw();

var notesMeasure2 = [
  new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "8" }),
  new Vex.Flow.StaveNote({ keys: ["d/4"], duration: "8" }),
  new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8" }),
  new Vex.Flow.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "8" }),
  new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "8" }),
  new Vex.Flow.StaveNote({ keys: ["d/4"], duration: "8" }),
  new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8" }),
  new Vex.Flow.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "8" })
];

// Automatic beaming
var beams = VF.Beam.generateBeams(notesMeasure2);
var voice = new Vex.Flow.Voice(Vex.Flow.TIME4_4);
voice.addTickables(notesMeasure2);
var formatter = new Vex.Flow.Formatter();
formatter.joinVoices([voice]).formatToStave([voice], staveMeasure2);
voice.draw(ctx, staveMeasure2);
beams.forEach(function(beam) {
  beam.setContext(ctx).draw();
});
Vex.Flow.Formatter.FormatAndDraw(ctx, staveMeasure2, notesMeasure2);
