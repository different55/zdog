// ----- setup ----- //
var isSpinning = true;

var model = new Zdog.Anchor();

// Made with Zdog

const orange = '#E62';
const garnet = '#C25';
const eggplant = '#636';

// origin dot
var dot = new Zdog.Shape({
  addTo: model,
  stroke: 8,
  color: eggplant,
});

var zCircle = new Zdog.Ellipse({
  addTo: model,
  diameter: 20,
  quarters: 2,
  closed: true,
  translate: { z: 40 },
  scale: 1,
  stroke: 8,
  fill: true,
  color: eggplant,
});

// z line
new Zdog.Shape({
  addTo: zCircle,
  path: [ {}, zCircle.translate.copy().multiply({ z: -1 }) ],
  scale: 1/zCircle.scale.z,
  stroke: 2,
  color: zCircle.color,
});

var xRect = new Zdog.Rect({
  addTo: zCircle,
  width: 20,
  height: 20,
  translate: { x: 40 },
  stroke: 8,
  fill: true,
  color: garnet,
});

// x line
new Zdog.Shape({
  addTo: xRect,
  path: [ {}, xRect.translate.copy().multiply({ x: -1 }) ],
  stroke: 2,
  color: xRect.color,
});

var yTri = new Zdog.Polygon({
  addTo: xRect,
  radius: 10,
  sides: 3,
  translate: { y: -60 },
  stroke: 8,
  fill: true,
  color: orange,
});

// y line
new Zdog.Shape({
  addTo: yTri,
  path: [ {}, yTri.translate.copy().multiply({ y: -1 }) ],
  stroke: 2,
  color: yTri.color,
});

var canvasDot = new Zdog.Illustration({
  element: 'canvas.dot',
  dragRotate: model,
  //centered: dot,
  onDragStart: function() {
    isSpinning = false;
  },
});

var canvasEggplant = new Zdog.Illustration({
  element: 'canvas.eggplant',
  dragRotate: model,
  centered: zCircle,
  onDragStart: function() {
    isSpinning = false;
  },
});
var canvasGarnet = new Zdog.Illustration({
  element: 'canvas.garnet',
  dragRotate: model,
  centered: xRect,
  onDragStart: function() {
    isSpinning = false;
  },
});
var canvasOrange = new Zdog.Illustration({
  element: 'canvas.orange',
  dragRotate: model,
  centered: yTri,
  onDragStart: function() {
    isSpinning = false;
  },
});

var svgDot = new Zdog.Illustration({
  element: 'svg.dot',
  dragRotate: model,
  isolated: true,
  //centered: dot,
  onDragStart: function() {
    isSpinning = false;
  },
});
var svgEggplant = new Zdog.Illustration({
  element: 'svg.eggplant',
  dragRotate: model,
  isolated: true,
  centered: zCircle,
  onDragStart: function() {
    isSpinning = false;
  },
});
var svgGarnet = new Zdog.Illustration({
  element: 'svg.garnet',
  dragRotate: model,
  isolated: true,
  centered: xRect,
  onDragStart: function() {
    isSpinning = false;
  },
});
var svgOrange = new Zdog.Illustration({
  element: 'svg.orange',
  dragRotate: model,
  centered: yTri,
  onDragStart: function() {
    isSpinning = false;
  },
});

// ----- animate ----- //

function animate() {
  model.rotate.y += isSpinning ? 0.03 : 0;
  model.updateGraph();

  canvasDot.renderGraph( model );
  canvasEggplant.renderGraph( model );
  canvasGarnet.renderGraph( model );
  canvasOrange.renderGraph( model );

  svgDot.renderGraph( model );
  svgEggplant.renderGraph( model );
  svgGarnet.renderGraph( model );
  svgOrange.renderGraph( model );

  requestAnimationFrame( animate );
}

animate();

