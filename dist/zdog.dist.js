/*!
 * Zdog v1.1.3
 * Round, flat, designer-friendly pseudo-3D engine
 * Licensed MIT
 * https://zzz.dog
 * Copyright 2020 Metafizzy
 */

/**
 * Boilerplate & utils
 */

( function( root, factory ) {
  // module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory();
  } else {
    // browser global
    root.Zdog = factory();
  }
}( this, function factory() {

var Zdog = {};

Zdog.TAU = Math.PI * 2;

Zdog.extend = function( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
};

Zdog.lerp = function( a, b, alpha ) {
  return ( b - a ) * alpha + a;
};

Zdog.modulo = function( num, div ) {
  return ( ( num % div ) + div ) % div;
};

var powerMultipliers = {
  2: function( a ) {
    return a * a;
  },
  3: function( a ) {
    return a * a * a;
  },
  4: function( a ) {
    return a * a * a * a;
  },
  5: function( a ) {
    return a * a * a * a * a;
  },
};

Zdog.easeInOut = function( alpha, power ) {
  if ( power == 1 ) {
    return alpha;
  }
  alpha = Math.max( 0, Math.min( 1, alpha ) );
  var isFirstHalf = alpha < 0.5;
  var slope = isFirstHalf ? alpha : 1 - alpha;
  slope /= 0.5;
  // make easing steeper with more multiples
  var powerMultiplier = powerMultipliers[ power ] || powerMultipliers[2];
  var curve = powerMultiplier( slope );
  curve /= 2;
  return isFirstHalf ? curve : 1 - curve;
};

Zdog.isColor = function(value) {
  return (typeof value == 'string') || (value && value.isTexture);
}
Zdog.cloneColor = function(value) {
  return (value && value.clone) ? value.clone() : value;
}

Zdog.exportGraph = function(model) {
  return JSON.parse( JSON.stringify( model ) );
};

return Zdog;

} ) );
/**
 * CanvasRenderer
 */

( function( root, factory ) {
  // module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory();
  } else {
    // browser global
    root.Zdog.CanvasRenderer = factory();
  }
}( this, function factory() {

var CanvasRenderer = { isCanvas: true };

CanvasRenderer.begin = function( ctx ) {
  ctx.beginPath();
};

CanvasRenderer.move = function( ctx, elem, point ) {
  ctx.moveTo( point.x, point.y );
};

CanvasRenderer.line = function( ctx, elem, point ) {
  ctx.lineTo( point.x, point.y );
};

CanvasRenderer.bezier = function( ctx, elem, cp0, cp1, end ) {
  ctx.bezierCurveTo( cp0.x, cp0.y, cp1.x, cp1.y, end.x, end.y );
};

CanvasRenderer.closePath = function( ctx ) {
  ctx.closePath();
};

CanvasRenderer.setPath = function() {};

CanvasRenderer.renderPath = function( ctx, elem, pathCommands, isClosed ) {
  this.begin( ctx, elem );
  pathCommands.forEach( function( command ) {
    command.render( ctx, elem, CanvasRenderer );
  } );
  if ( isClosed ) {
    this.closePath( ctx, elem );
  }
};

CanvasRenderer.stroke = function( ctx, elem, isStroke, color, lineWidth ) {
  if ( !isStroke ) {
    return;
  }
  ctx.lineWidth = lineWidth;
  if (color && color.getCanvasFill) {
    ctx.save();
    ctx.strokeStyle = color.getCanvasFill(ctx);
    ctx.stroke();
    ctx.restore();
  } else {
    ctx.strokeStyle = color;
    ctx.stroke();
  }
};

CanvasRenderer.fill = function( ctx, elem, isFill, color ) {
  if ( !isFill ) {
    return;
  }
  if (color && color.getCanvasFill) {
    ctx.save();
    ctx.fillStyle = color.getCanvasFill(ctx);
    ctx.fill();
    ctx.restore();
  } else {
    ctx.fillStyle = color;
    ctx.fill();
  }
};

CanvasRenderer.end = function() {};

return CanvasRenderer;

} ) );
/**
 * SvgRenderer
 */

( function( root, factory ) {
  // module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory();
  } else {
    // browser global
    root.Zdog.SvgRenderer = factory();
  }
}( this, function factory() {

var SvgRenderer = { isSvg: true };

// round path coordinates to 3 decimals
var round = SvgRenderer.round = function( num ) {
  return Math.round( num * 1000 ) / 1000;
};

function getPointString( point ) {
  return round( point.x ) + ',' + round( point.y ) + ' ';
}

SvgRenderer.begin = function() {};

SvgRenderer.move = function( svg, elem, point ) {
  return 'M' + getPointString( point );
};

SvgRenderer.line = function( svg, elem, point ) {
  return 'L' + getPointString( point );
};

SvgRenderer.bezier = function( svg, elem, cp0, cp1, end ) {
  return 'C' + getPointString( cp0 ) + getPointString( cp1 ) +
    getPointString( end );
};

SvgRenderer.closePath = function( /* elem */) {
  return 'Z';
};

SvgRenderer.setPath = function( svg, elem, pathValue ) {
  elem.setAttribute( 'd', pathValue );
};

SvgRenderer.renderPath = function( svg, elem, pathCommands, isClosed ) {
  var pathValue = '';
  pathCommands.forEach( function( command ) {
    pathValue += command.render( svg, elem, SvgRenderer );
  } );
  if ( isClosed ) {
    pathValue += this.closePath( svg, elem );
  }
  this.setPath( svg, elem, pathValue );
};

SvgRenderer.stroke = function( svg, elem, isStroke, color, lineWidth ) {
  if ( !isStroke ) {
    return;
  }
  if (color && color.getSvgFill) {
    color = color.getSvgFill(svg);
  }
  elem.setAttribute( 'stroke', color );
  elem.setAttribute( 'stroke-width', lineWidth );
};

SvgRenderer.fill = function( svg, elem, isFill, color ) {
  var fillColor = isFill ? color : 'none';
  if (fillColor && fillColor.getSvgFill) {
    fillColor = fillColor.getSvgFill(svg);
  }
  elem.setAttribute( 'fill', fillColor );
};

SvgRenderer.end = function( svg, elem ) {
  svg.appendChild( elem );
};

return SvgRenderer;

} ) );
/**
 * Vector
 */

( function( root, factory ) {
  // module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory( require('./boilerplate') );
  } else {
    // browser global
    var Zdog = root.Zdog;
    Zdog.Vector = factory( Zdog );
  }

}( this, function factory( utils ) {

function Vector( position ) {
  this.set( position );
}

var TAU = utils.TAU;

// 'pos' = 'position'
Vector.prototype.set = function( pos ) {
  this.x = pos && pos.x || 0;
  this.y = pos && pos.y || 0;
  this.z = pos && pos.z || 0;
  return this;
};

// set coordinates without sanitizing
// vec.write({ y: 2 }) only sets y coord
Vector.prototype.write = function( pos ) {
  if ( !pos ) {
    return this;
  }
  this.x = pos.x != undefined ? pos.x : this.x;
  this.y = pos.y != undefined ? pos.y : this.y;
  this.z = pos.z != undefined ? pos.z : this.z;
  return this;
};

Vector.prototype.rotate = function( rotation ) {
  if ( !rotation ) {
    return;
  }
  this.rotateZ( rotation.z );
  this.rotateY( rotation.y );
  this.rotateX( rotation.x );
  return this;
};

Vector.prototype.rotateZ = function( angle ) {
  rotateProperty( this, angle, 'x', 'y' );
};

Vector.prototype.rotateX = function( angle ) {
  rotateProperty( this, angle, 'y', 'z' );
};

Vector.prototype.rotateY = function( angle ) {
  rotateProperty( this, angle, 'x', 'z' );
};

function rotateProperty( vec, angle, propA, propB ) {
  if ( !angle || angle % TAU === 0 ) {
    return;
  }
  var cos = Math.cos( angle );
  var sin = Math.sin( angle );
  var a = vec[ propA ];
  var b = vec[ propB ];
  vec[ propA ] = a * cos - b * sin;
  vec[ propB ] = b * cos + a * sin;
}

Vector.prototype.isSame = function( pos ) {
  if ( !pos ) {
    return false;
  }
  return this.x === pos.x && this.y === pos.y && this.z === pos.z;
};

Vector.prototype.add = function( pos ) {
  if ( !pos ) {
    return this;
  }
  this.x += pos.x || 0;
  this.y += pos.y || 0;
  this.z += pos.z || 0;
  return this;
};

Vector.prototype.subtract = function( pos ) {
  if ( !pos ) {
    return this;
  }
  this.x -= pos.x || 0;
  this.y -= pos.y || 0;
  this.z -= pos.z || 0;
  return this;
};

Vector.prototype.multiply = function( pos ) {
  if ( pos == undefined ) {
    return this;
  }
  // multiple all values by same number
  if ( typeof pos == 'number' ) {
    this.x *= pos;
    this.y *= pos;
    this.z *= pos;
  } else {
    // multiply object
    this.x *= pos.x != undefined ? pos.x : 1;
    this.y *= pos.y != undefined ? pos.y : 1;
    this.z *= pos.z != undefined ? pos.z : 1;
  }
  return this;
};

Vector.prototype.transform = function( translation, rotation, scale ) {
  this.multiply( scale );
  this.rotate( rotation );
  this.add( translation );
  return this;
};

Vector.prototype.lerp = function( pos, alpha ) {
  this.x = utils.lerp( this.x, pos.x || 0, alpha );
  this.y = utils.lerp( this.y, pos.y || 0, alpha );
  this.z = utils.lerp( this.z, pos.z || 0, alpha );
  return this;
};

Vector.prototype.magnitude = function() {
  var sum = this.x * this.x + this.y * this.y + this.z * this.z;
  return getMagnitudeSqrt( sum );
};

function getMagnitudeSqrt( sum ) {
  // PERF: check if sum ~= 1 and skip sqrt
  if ( Math.abs( sum - 1 ) < 0.00000001 ) {
    return 1;
  }
  return Math.sqrt( sum );
}

Vector.prototype.magnitude2d = function() {
  var sum = this.x * this.x + this.y * this.y;
  return getMagnitudeSqrt( sum );
};

Vector.prototype.copy = function() {
  return new Vector( this );
};

function round( num ) {
  return Math.round( num * 1000 ) / 1000;
}

Vector.prototype.toJSON = function() {
  var x = this.x;
  var y = this.y;
  var z = this.z;

  if ( x === y && y === z ) {
    return x !== 0 ? round( x ) : undefined;
  }

  var obj = { x: x, y: y, z: z };
  var result = {};

  Object.keys( obj ).forEach( function( key ) {
    var value = obj[ key ];
    if ( value !== 0 ) {
      result[ key ] = round( value );
    }
  });

  return Object.keys( result ).length ? result : undefined;
};

return Vector;

} ) );
/**
 * Anchor
 */

( function( root, factory ) {
  // module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory( require('./boilerplate'), require('./vector'),
        require('./canvas-renderer'), require('./svg-renderer') );
  } else {
    // browser global
    var Zdog = root.Zdog;
    Zdog.Anchor = factory( Zdog, Zdog.Vector, Zdog.CanvasRenderer,
        Zdog.SvgRenderer );
  }
}( this, function factory( utils, Vector, CanvasRenderer, SvgRenderer ) {

var TAU = utils.TAU;
var onePoint = { x: 1, y: 1, z: 1 };

function Anchor( options ) {
  this.create( options || {} );
}
Anchor.type = 'Anchor';

Anchor.prototype.create = function( options ) {
  this.children = [];
  // set defaults & options
  utils.extend( this, this.constructor.defaults );
  this.setOptions( options );

  // transform
  this.translate = new Vector( options.translate );
  this.rotate = new Vector( options.rotate );
  this.scale = new Vector( onePoint ).multiply( this.scale );
  // origin
  this.origin = new Vector();
  this.renderOrigin = new Vector();

  if ( this.addTo ) {
    this.addTo.addChild( this );
  }
  if ( options.importGraph ) {
    this.importGraph( options.importGraph );
  }
};

Anchor.defaults = {};

Anchor.optionKeys = Object.keys( Anchor.defaults ).concat([
  'rotate',
  'translate',
  'scale',
  'addTo',
]);

Anchor.ignoreKeysJSON = [
  'addTo',
];

Anchor.prototype.setOptions = function( options ) {
  var optionKeys = this.constructor.optionKeys;

  for ( var key in options ) {
    if ( optionKeys.indexOf( key ) != -1 ) {
      this[ key ] = options[ key ];
    }
  }
};

Anchor.prototype.addChild = function( shape ) {
  if ( this.children.indexOf( shape ) != -1 ) {
    return;
  }
  shape.remove(); // remove previous parent
  shape.addTo = this; // keep parent reference
  this.children.push( shape );
};

Anchor.prototype.removeChild = function( shape ) {
  var index = this.children.indexOf( shape );
  if ( index != -1 ) {
    this.children.splice( index, 1 );
  }
};

Anchor.prototype.remove = function() {
  if ( this.addTo ) {
    this.addTo.removeChild( this );
  }
};

// ----- update ----- //

Anchor.prototype.update = function() {
  // update self
  this.reset();
  // update children
  this.children.forEach( function( child ) {
    child.update();
  } );
  this.transform( this.translate, this.rotate, this.scale );
};

Anchor.prototype.reset = function() {
  this.renderOrigin.set( this.origin );
};

Anchor.prototype.transform = function( translation, rotation, scale ) {
  this.renderOrigin.transform( translation, rotation, scale );
  // transform children
  this.children.forEach( function( child ) {
    child.transform( translation, rotation, scale );
  } );
};

Anchor.prototype.updateGraph = function() {
  this.update();
  this.updateFlatGraph();
  this.flatGraph.forEach( function( item ) {
    item.updateSortValue();
  } );
  // z-sort
  this.flatGraph.sort( Anchor.shapeSorter );
};

Anchor.shapeSorter = function( a, b ) {
  return a.sortValue - b.sortValue;
};

// custom getter to check for flatGraph before using it
Object.defineProperty( Anchor.prototype, 'flatGraph', {
  get: function() {
    if ( !this._flatGraph ) {
      this.updateFlatGraph();
    }
    return this._flatGraph;
  },
  set: function( graph ) {
    this._flatGraph = graph;
  },
} );

Anchor.prototype.updateFlatGraph = function() {
  this.flatGraph = this.getFlatGraph();
};

// return Array of self & all child graph items
Anchor.prototype.getFlatGraph = function() {
  var flatGraph = [ this ];
  return this.addChildFlatGraph( flatGraph );
};

Anchor.prototype.addChildFlatGraph = function( flatGraph ) {
  this.children.forEach( function( child ) {
    var childFlatGraph = child.getFlatGraph();
    Array.prototype.push.apply( flatGraph, childFlatGraph );
  } );
  return flatGraph;
};

Anchor.prototype.updateSortValue = function() {
  this.sortValue = this.renderOrigin.z;
};

// ----- render ----- //

Anchor.prototype.render = function() {};

// TODO refactor out CanvasRenderer so its not a dependency within anchor.js
Anchor.prototype.renderGraphCanvas = function( ctx ) {
  if ( !ctx ) {
    throw new Error( 'ctx is ' + ctx + '. ' +
      'Canvas context required for render. Check .renderGraphCanvas( ctx ).' );
  }
  this.flatGraph.forEach( function( item ) {
    item.render( ctx, CanvasRenderer );
  } );
};

Anchor.prototype.renderGraphSvg = function( svg ) {
  if ( !svg ) {
    throw new Error( 'svg is ' + svg + '. ' +
      'SVG required for render. Check .renderGraphSvg( svg ).' );
  }
  this.flatGraph.forEach( function( item ) {
    item.render( svg, SvgRenderer );
  } );
};

// ----- misc ----- //

Anchor.prototype.copy = function( options ) {
  // copy options
  var itemOptions = {};
  var optionKeys = this.constructor.optionKeys;
  optionKeys.forEach( function( key ) {
    itemOptions[ key ] = this[ key ];
  }, this );
  // add set options
  utils.extend( itemOptions, options );
  var ItemClass = this.constructor;
  return new ItemClass( itemOptions );
};

Anchor.prototype.copyGraph = function( options ) {
  var clone = this.copy( options );
  this.children.forEach( function( child ) {
    child.copyGraph({
      addTo: clone,
    });
  } );
  return clone;
};

Anchor.prototype.importGraph = function( model ) {
  this.addChild( revive( model ) );

  function revive( graph ) {
    graph = utils.extend( {}, graph );
    // quick hack to avoid nested Illustration items
    var type = graph.type === 'Illustration' ? 'Anchor' : graph.type;
    var children = (graph.children || []).slice( 0 );
    delete graph.children;

    var Item = utils[ type ];
    var rootGraph;
    if ( Item ) {
      rootGraph = new Item( graph );
      children.forEach( function( child ) {
        revive( utils.extend( child, { addTo: rootGraph } ) );
      } );
    }
    return rootGraph;
  }
};

Anchor.prototype.normalizeRotate = function() {
  this.rotate.x = utils.modulo( this.rotate.x, TAU );
  this.rotate.y = utils.modulo( this.rotate.y, TAU );
  this.rotate.z = utils.modulo( this.rotate.z, TAU );
};

Anchor.prototype.toJSON = function() {
  var type = this.constructor.type;
  var result = { type: type };
  var defaults = this.constructor.defaults;
  var optionKeys = this.constructor.optionKeys.slice(0).concat('children');
  var ignoreKeys = Anchor.ignoreKeysJSON
    .slice(0)
    .concat(this.constructor.ignoreKeysJSON || []);

  optionKeys.forEach(function( key ) {
    if (ignoreKeys.indexOf(key) > -1) {
      return;
    }
    var value = this[key];

    if (
      ![ 'undefined', 'function' ].indexOf(typeof value) > -1 &&
        value !== defaults[key]
    ) {
      if (Array.isArray(value) && value.length === 0) {
        return;
      }
      if (value.toJSON) {
        var serialized = value.toJSON();
        if (typeof serialized !== 'undefined') {
          if (key === 'scale' && serialized === 1) {
            return;
          }
          result[key] = serialized;
        }
      } else {
        result[key] = value;
      }
    }
  }, this);

  return result;
};

// ----- subclass ----- //

function getSubclass( Super ) {
  return function( defaults ) {
    // create constructor
    function Item( options ) {
      this.create( options || {} );
    }

    Item.prototype = Object.create( Super.prototype );
    Item.prototype.constructor = Item;

    Item.defaults = utils.extend( {}, Super.defaults );
    utils.extend( Item.defaults, defaults );
    // create optionKeys
    Item.optionKeys = Super.optionKeys.slice( 0 );
    // add defaults keys to optionKeys, dedupe
    Object.keys( Item.defaults ).forEach( function( key ) {
      if ( !Item.optionKeys.indexOf( key ) != 1 ) {
        Item.optionKeys.push( key );
      }
    });
    // create ignoreKeysJSON
    Item.ignoreKeysJSON = Super.ignoreKeysJSON.slice(0);

    Item.subclass = getSubclass( Item );

    return Item;
  };
}

Anchor.subclass = getSubclass( Anchor );

return Anchor;

} ) );
/**
 * Dragger
 */

( function( root, factory ) {
  // module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory();
  } else {
    // browser global
    root.Zdog.Dragger = factory();
  }
}( this, function factory() {

// quick & dirty drag event stuff
// messes up if multiple pointers/touches

// check for browser window #85
var hasWindow = typeof window != 'undefined';
// event support, default to mouse events
var downEvent = 'mousedown';
var moveEvent = 'mousemove';
var upEvent = 'mouseup';
if ( hasWindow ) {
  if ( window.PointerEvent ) {
    // PointerEvent, Chrome
    downEvent = 'pointerdown';
    moveEvent = 'pointermove';
    upEvent = 'pointerup';
  } else if ( 'ontouchstart' in window ) {
    // Touch Events, iOS Safari
    downEvent = 'touchstart';
    moveEvent = 'touchmove';
    upEvent = 'touchend';
  }
}

function noop() {}

function Dragger( options ) {
  this.create( options || {} );
}

Dragger.prototype.create = function( options ) {
  this.onDragStart = options.onDragStart || noop;
  this.onDragMove = options.onDragMove || noop;
  this.onDragEnd = options.onDragEnd || noop;

  this.bindDrag( options.startElement );
};

Dragger.prototype.bindDrag = function( element ) {
  element = this.getQueryElement( element );
  if ( !element ) {
    return;
  }
  // disable browser gestures #53
  element.style.touchAction = 'none';
  element.addEventListener( downEvent, this );
};

Dragger.prototype.getQueryElement = function( element ) {
  if ( typeof element == 'string' ) {
    // with string, query selector
    element = document.querySelector( element );
  }
  return element;
};

Dragger.prototype.handleEvent = function( event ) {
  var method = this[ 'on' + event.type ];
  if ( method ) {
    method.call( this, event );
  }
};

Dragger.prototype.onmousedown =
Dragger.prototype.onpointerdown = function( event ) {
  this.dragStart( event, event );
};

Dragger.prototype.ontouchstart = function( event ) {
  this.dragStart( event, event.changedTouches[0] );
};

Dragger.prototype.dragStart = function( event, pointer ) {
  event.preventDefault();
  this.dragStartX = pointer.pageX;
  this.dragStartY = pointer.pageY;
  if ( hasWindow ) {
    window.addEventListener( moveEvent, this );
    window.addEventListener( upEvent, this );
  }
  this.onDragStart( pointer );
};

Dragger.prototype.ontouchmove = function( event ) {
  // HACK, moved touch may not be first
  this.dragMove( event, event.changedTouches[0] );
};

Dragger.prototype.onmousemove =
Dragger.prototype.onpointermove = function( event ) {
  this.dragMove( event, event );
};

Dragger.prototype.dragMove = function( event, pointer ) {
  event.preventDefault();
  var moveX = pointer.pageX - this.dragStartX;
  var moveY = pointer.pageY - this.dragStartY;
  this.onDragMove( pointer, moveX, moveY );
};

Dragger.prototype.onmouseup =
Dragger.prototype.onpointerup =
Dragger.prototype.ontouchend =
Dragger.prototype.dragEnd = function( /* event */) {
  window.removeEventListener( moveEvent, this );
  window.removeEventListener( upEvent, this );
  this.onDragEnd();
};

return Dragger;

} ) );
/**
 * Illustration
 */

( function( root, factory ) {
  // module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory( require('./boilerplate'), require('./anchor'),
        require('./dragger') );
  } else {
    // browser global
    var Zdog = root.Zdog;
    Zdog.Illustration = factory( Zdog, Zdog.Anchor, Zdog.Dragger );
  }
}( this, function factory( utils, Anchor, Dragger ) {

function noop() {}
var TAU = utils.TAU;

var Illustration = Anchor.subclass({
  element: undefined,
  centered: true,
  zoom: 1,
  dragRotate: false,
  resize: false,
  onPrerender: noop,
  onDragStart: noop,
  onDragMove: noop,
  onDragEnd: noop,
  onResize: noop,
});
Illustration.ignoreKeysJSON = [ 'dragRotate', 'element', 'resize' ];
Illustration.type = 'Illustration';

utils.extend( Illustration.prototype, Dragger.prototype );

Illustration.prototype.create = function( options ) {
  Anchor.prototype.create.call( this, options );
  Dragger.prototype.create.call( this, options );
  this.setElement( this.element );
  this.setDragRotate( this.dragRotate );
  this.setResize( this.resize );
};

Illustration.prototype.setElement = function( element ) {
  element = this.getQueryElement( element );
  if ( !element ) {
    throw new Error( 'Zdog.Illustration element required. Set to ' + element );
  }

  var nodeName = element.nodeName.toLowerCase();
  if ( nodeName == 'canvas' ) {
    this.setCanvas( element );
  } else if ( nodeName == 'svg' ) {
    this.setSvg( element );
  }
};

Illustration.prototype.setSize = function( width, height ) {
  width = Math.round( width );
  height = Math.round( height );
  if ( this.isCanvas ) {
    this.setSizeCanvas( width, height );
  } else if ( this.isSvg ) {
    this.setSizeSvg( width, height );
  }
};

Illustration.prototype.setResize = function( resize ) {
  this.resize = resize;
  // create resize event listener
  if ( !this.resizeListener ) {
    this.resizeListener = this.onWindowResize.bind( this );
  }
  // add/remove event listener
  if ( resize ) {
    window.addEventListener( 'resize', this.resizeListener );
    this.onWindowResize();
  } else {
    window.removeEventListener( 'resize', this.resizeListener );
  }
};

// TODO debounce this?
Illustration.prototype.onWindowResize = function() {
  this.setMeasuredSize();
  this.onResize( this.width, this.height );
};

Illustration.prototype.setMeasuredSize = function() {
  var width, height;
  var isFullscreen = this.resize == 'fullscreen';
  if ( isFullscreen ) {
    width = window.innerWidth;
    height = window.innerHeight;
  } else {
    var rect = this.element.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
  }
  this.setSize( width, height );
};

// ----- render ----- //

Illustration.prototype.renderGraph = function( item ) {
  if ( this.isCanvas ) {
    this.renderGraphCanvas( item );
  } else if ( this.isSvg ) {
    this.renderGraphSvg( item );
  }
};

// combo method
Illustration.prototype.updateRenderGraph = function( item ) {
  this.updateGraph();
  this.renderGraph( item );
};

// ----- canvas ----- //

Illustration.prototype.setCanvas = function( element ) {
  this.element = element;
  this.isCanvas = true;
  // update related properties
  this.ctx = this.element.getContext('2d');
  // set initial size
  this.setSizeCanvas( element.width, element.height );
};

Illustration.prototype.setSizeCanvas = function( width, height ) {
  this.width = width;
  this.height = height;
  // up-rez for hi-DPI devices
  var pixelRatio = this.pixelRatio = window.devicePixelRatio || 1;
  this.element.width = this.canvasWidth = width * pixelRatio;
  this.element.height = this.canvasHeight = height * pixelRatio;
  var needsHighPixelRatioSizing = pixelRatio > 1 && !this.resize;
  if ( needsHighPixelRatioSizing ) {
    this.element.style.width = width + 'px';
    this.element.style.height = height + 'px';
  }
};

Illustration.prototype.renderGraphCanvas = function( item ) {
  item = item || this;
  this.prerenderCanvas();
  Anchor.prototype.renderGraphCanvas.call( item, this.ctx );
  this.postrenderCanvas();
};

Illustration.prototype.prerenderCanvas = function() {
  var ctx = this.ctx;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.clearRect( 0, 0, this.canvasWidth, this.canvasHeight );
  ctx.save();
  if ( this.centered ) {
    var centerX = this.width / 2 * this.pixelRatio;
    var centerY = this.height / 2 * this.pixelRatio;
    ctx.translate( centerX, centerY );
  }
  var scale = this.pixelRatio * this.zoom;
  ctx.scale( scale, scale );
  this.onPrerender( ctx );
};

Illustration.prototype.postrenderCanvas = function() {
  this.ctx.restore();
};

// ----- svg ----- //

Illustration.prototype.setSvg = function( element ) {
  this.element = element;
  this.isSvg = true;
  this.pixelRatio = 1;
  // set initial size from width & height attributes
  var width = element.getAttribute('width');
  var height = element.getAttribute('height');
  this.setSizeSvg( width, height );
};

Illustration.prototype.setSizeSvg = function( width, height ) {
  this.width = width;
  this.height = height;
  var viewWidth = width / this.zoom;
  var viewHeight = height / this.zoom;
  var viewX = this.centered ? -viewWidth/2 : 0;
  var viewY = this.centered ? -viewHeight/2 : 0;
  this.element.setAttribute( 'viewBox', viewX + ' ' + viewY + ' ' +
    viewWidth + ' ' + viewHeight );
  if ( this.resize ) {
    // remove size attributes, let size be determined by viewbox
    this.element.removeAttribute('width');
    this.element.removeAttribute('height');
  } else {
    this.element.setAttribute( 'width', width );
    this.element.setAttribute( 'height', height );
  }
};

Illustration.prototype.renderGraphSvg = function( item ) {
  item = item || this;
  empty( this.element );
  this.onPrerender( this.element );
  Anchor.prototype.renderGraphSvg.call( item, this.element );
};

function empty( element ) {
  while ( element.firstChild ) {
    element.removeChild( element.firstChild );
  }
}

// ----- drag ----- //

Illustration.prototype.setDragRotate = function( item ) {
  if ( !item ) {
    return;
  } else if ( item === true ) {
    /* eslint consistent-this: "off" */
    item = this;
  }
  this.dragRotate = item;

  this.bindDrag( this.element );
};

Illustration.prototype.dragStart = function( /* event, pointer */) {
  this.dragStartRX = this.dragRotate.rotate.x;
  this.dragStartRY = this.dragRotate.rotate.y;
  Dragger.prototype.dragStart.apply( this, arguments );
};

Illustration.prototype.dragMove = function( event, pointer ) {
  var moveX = pointer.pageX - this.dragStartX;
  var moveY = pointer.pageY - this.dragStartY;
  var displaySize = Math.min( this.width, this.height );
  var moveRY = moveX/displaySize * TAU;
  var moveRX = moveY/displaySize * TAU;
  this.dragRotate.rotate.x = this.dragStartRX - moveRX;
  this.dragRotate.rotate.y = this.dragStartRY - moveRY;
  Dragger.prototype.dragMove.apply( this, arguments );
};

return Illustration;

} ) );
/**
 * PathCommand
 */

( function( root, factory ) {
  // module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory( require('./vector') );
  } else {
    // browser global
    var Zdog = root.Zdog;
    Zdog.PathCommand = factory( Zdog.Vector );
  }
}( this, function factory( Vector ) {

function PathCommand( method, points, previousPoint ) {
  this.method = method;
  this.points = points.map( mapVectorPoint );
  this.renderPoints = points.map( mapNewVector );
  this.previousPoint = previousPoint;
  this.endRenderPoint = this.renderPoints[ this.renderPoints.length - 1 ];
  // arc actions come with previous point & corner point
  // but require bezier control points
  if ( method == 'arc' ) {
    this.controlPoints = [ new Vector(), new Vector() ];
  }
}

function mapVectorPoint( point ) {
  if ( point instanceof Vector ) {
    return point;
  } else {
    return new Vector( point );
  }
}

function mapNewVector( point ) {
  return new Vector( point );
}

PathCommand.prototype.reset = function() {
  // reset renderPoints back to orignal points position
  var points = this.points;
  this.renderPoints.forEach( function( renderPoint, i ) {
    var point = points[i];
    renderPoint.set( point );
  } );
};

PathCommand.prototype.transform = function( translation, rotation, scale ) {
  this.renderPoints.forEach( function( renderPoint ) {
    renderPoint.transform( translation, rotation, scale );
  } );
};

PathCommand.prototype.render = function( ctx, elem, renderer ) {
  return this[ this.method ]( ctx, elem, renderer );
};

PathCommand.prototype.move = function( ctx, elem, renderer ) {
  return renderer.move( ctx, elem, this.renderPoints[0] );
};

PathCommand.prototype.line = function( ctx, elem, renderer ) {
  return renderer.line( ctx, elem, this.renderPoints[0] );
};

PathCommand.prototype.bezier = function( ctx, elem, renderer ) {
  var cp0 = this.renderPoints[0];
  var cp1 = this.renderPoints[1];
  var end = this.renderPoints[2];
  return renderer.bezier( ctx, elem, cp0, cp1, end );
};

var arcHandleLength = 9/16;

PathCommand.prototype.arc = function( ctx, elem, renderer ) {
  var prev = this.previousPoint;
  var corner = this.renderPoints[0];
  var end = this.renderPoints[1];
  var cp0 = this.controlPoints[0];
  var cp1 = this.controlPoints[1];
  cp0.set( prev ).lerp( corner, arcHandleLength );
  cp1.set( end ).lerp( corner, arcHandleLength );
  return renderer.bezier( ctx, elem, cp0, cp1, end );
};

return PathCommand;

} ) );
/**
 * Shape
 */

( function( root, factory ) {
  // module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory( require('./boilerplate'), require('./vector'),
        require('./path-command'), require('./anchor') );
  } else {
    // browser global
    var Zdog = root.Zdog;
    Zdog.Shape = factory( Zdog, Zdog.Vector, Zdog.PathCommand, Zdog.Anchor );
  }
}( this, function factory( utils, Vector, PathCommand, Anchor ) {

var Shape = Anchor.subclass({
  stroke: 1,
  fill: false,
  color: '#333',
  closed: true,
  visible: true,
  path: [ {} ],
  front: { z: 1 },
  backface: true,
});

Shape.type = 'Shape';

Shape.prototype.create = function( options ) {
  Anchor.prototype.create.call( this, options );
  this.updatePath();
  // front
  this.front = new Vector( options.front || this.front );
  this.renderFront = new Vector( this.front );
  this.renderNormal = new Vector();
};

var actionNames = [
  'move',
  'line',
  'bezier',
  'arc',
];

Shape.prototype.updatePath = function() {
  this.setPath();
  this.updatePathCommands();
};

// place holder for Ellipse, Rect, etc.
Shape.prototype.setPath = function() {};

// parse path into PathCommands
Shape.prototype.updatePathCommands = function() {
  var previousPoint;
  this.pathCommands = this.path.map( function( pathPart, i ) {
    // pathPart can be just vector coordinates -> { x, y, z }
    // or path instruction -> { arc: [ {x0,y0,z0}, {x1,y1,z1} ] }
    var keys = Object.keys( pathPart );
    var method = keys[0];
    var points = pathPart[ method ];
    // default to line if no instruction
    var isInstruction = keys.length == 1 && actionNames.indexOf( method ) != -1;
    if ( !isInstruction ) {
      method = 'line';
      points = pathPart;
    }
    // munge single-point methods like line & move without arrays
    var isLineOrMove = method == 'line' || method == 'move';
    var isPointsArray = Array.isArray( points );
    if ( isLineOrMove && !isPointsArray ) {
      points = [ points ];
    }

    // first action is always move
    method = i === 0 ? 'move' : method;
    // arcs require previous last point
    var command = new PathCommand( method, points, previousPoint );
    // update previousLastPoint
    previousPoint = command.endRenderPoint;
    return command;
  } );
};

// ----- update ----- //

Shape.prototype.reset = function() {
  this.renderOrigin.set( this.origin );
  this.renderFront.set( this.front );
  // reset command render points
  this.pathCommands.forEach( function( command ) {
    command.reset();
  } );

  if (this.backface && this.backface.reset) {
    this.backface.reset();
  }
  if (this.color && this.color.reset) {
    this.color.reset();
  }
};

Shape.prototype.transform = function( translation, rotation, scale ) {
  // calculate render points backface visibility & cone/hemisphere shapes
  this.renderOrigin.transform( translation, rotation, scale );
  this.renderFront.transform( translation, rotation, scale );
  this.renderNormal.set( this.renderOrigin ).subtract( this.renderFront );
  // transform points
  this.pathCommands.forEach( function( command ) {
    command.transform( translation, rotation, scale );
  } );
  // transform children
  this.children.forEach( function( child ) {
    child.transform( translation, rotation, scale );
  } );
  if (this.backface && this.backface.transform) {
    this.backface.transform( translation, rotation, scale );
  }
  if (this.color && this.color.transform) {
    this.color.transform( translation, rotation, scale );
  }
};

Shape.prototype.updateSortValue = function() {
  // sort by average z of all points
  // def not geometrically correct, but works for me
  var pointCount = this.pathCommands.length;
  var firstPoint = this.pathCommands[0].endRenderPoint;
  var lastPoint = this.pathCommands[ pointCount - 1 ].endRenderPoint;
  // ignore the final point if self closing shape
  var isSelfClosing = pointCount > 2 && firstPoint.isSame( lastPoint );
  if ( isSelfClosing ) {
    pointCount -= 1;
  }

  var sortValueTotal = 0;
  for ( var i = 0; i < pointCount; i++ ) {
    sortValueTotal += this.pathCommands[i].endRenderPoint.z;
  }
  this.sortValue = sortValueTotal/pointCount;
};

// ----- render ----- //

Shape.prototype.render = function( ctx, renderer ) {
  var length = this.pathCommands.length;
  if ( !this.visible || !length ) {
    return;
  }
  // do not render if hiding backface
  this.isFacingBack = this.renderNormal.z > 0;
  if ( !this.backface && this.isFacingBack ) {
    return;
  }
  if ( !renderer ) {
    throw new Error( 'Zdog renderer required. Set to ' + renderer );
  }
  // render dot or path
  var isDot = length == 1;
  if ( renderer.isCanvas && isDot ) {
    this.renderCanvasDot( ctx, renderer );
  } else {
    this.renderPath( ctx, renderer );
  }
};

var TAU = utils.TAU;
// Safari does not render lines with no size, have to render circle instead
Shape.prototype.renderCanvasDot = function( ctx , renderer) {
  var lineWidth = this.getLineWidth();
  if ( !lineWidth ) {
    return;
  }
  var point = this.pathCommands[0].endRenderPoint;
  ctx.beginPath();
  var radius = lineWidth/2;
  ctx.arc( point.x, point.y, radius, 0, TAU );
  renderer.fill(ctx, null, true, this.getRenderColor() );
};

Shape.prototype.getLineWidth = function() {
  if ( !this.stroke ) {
    return 0;
  }
  if ( this.stroke == true ) {
    return 1;
  }
  return this.stroke;
};

Shape.prototype.getRenderColor = function() {
  // use backface color if applicable
  var isBackfaceColor = utils.isColor(this.backface) && this.isFacingBack;
  var color = isBackfaceColor ? this.backface : this.color;
  return color;
};

Shape.prototype.renderPath = function( ctx, renderer ) {
  var elem = this.getRenderElement( ctx, renderer );
  var isTwoPoints = this.pathCommands.length == 2 &&
    this.pathCommands[1].method == 'line';
  var isClosed = !isTwoPoints && this.closed;
  var color = this.getRenderColor();

  renderer.renderPath( ctx, elem, this.pathCommands, isClosed );
  renderer.stroke( ctx, elem, this.stroke, color, this.getLineWidth() );
  renderer.fill( ctx, elem, this.fill, color );
  renderer.end( ctx, elem );
};

var svgURI = 'http://www.w3.org/2000/svg';

Shape.prototype.getRenderElement = function( ctx, renderer ) {
  if ( !renderer.isSvg ) {
    return;
  }
  if ( !this.svgElement ) {
    // create svgElement
    this.svgElement = document.createElementNS( svgURI, 'path' );
    this.svgElement.setAttribute( 'stroke-linecap', 'round' );
    this.svgElement.setAttribute( 'stroke-linejoin', 'round' );
  }
  return this.svgElement;
};

return Shape;

} ) );
/**
 * Group
 */

( function( root, factory ) {
  // module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory( require('./anchor') );
  } else {
    // browser global
    var Zdog = root.Zdog;
    Zdog.Group = factory( Zdog.Anchor );
  }
}( this, function factory( Anchor ) {

var Group = Anchor.subclass({
  updateSort: false,
  visible: true,
});

Group.type = 'Group';


// ----- update ----- //

Group.prototype.updateSortValue = function() {
  var sortValueTotal = 0;
  this.flatGraph.forEach( function( item ) {
    item.updateSortValue();
    sortValueTotal += item.sortValue;
  } );
  // average sort value of all points
  // def not geometrically correct, but works for me
  this.sortValue = sortValueTotal / this.flatGraph.length;

  if ( this.updateSort ) {
    this.flatGraph.sort( Anchor.shapeSorter );
  }
};

// ----- render ----- //

Group.prototype.render = function( ctx, renderer ) {
  if ( !this.visible ) {
    return;
  }

  this.flatGraph.forEach( function( item ) {
    item.render( ctx, renderer );
  } );
};

// actual group flatGraph only used inside group
Group.prototype.updateFlatGraph = function() {
  // do not include self
  var flatGraph = [];
  this.flatGraph = this.addChildFlatGraph( flatGraph );
};

// do not include children, group handles rendering & sorting internally
Group.prototype.getFlatGraph = function() {
  return [ this ];
};

return Group;

} ) );
/**
 * Rect
 */

( function( root, factory ) {
  // module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory( require('./shape') );
  } else {
    // browser global
    var Zdog = root.Zdog;
    Zdog.Rect = factory( Zdog.Shape );
  }
}( this, function factory( Shape ) {

var Rect = Shape.subclass({
  width: 1,
  height: 1,
});

Rect.type = 'Rect';

Rect.prototype.setPath = function() {
  var x = this.width / 2;
  var y = this.height / 2;
  /* eslint key-spacing: "off" */
  this.path = [
    { x: -x, y: -y },
    { x:  x, y: -y },
    { x:  x, y:  y },
    { x: -x, y:  y },
  ];
};

return Rect;

} ) );
/**
 * RoundedRect
 */

( function( root, factory ) {
  // module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory( require('./shape') );
  } else {
    // browser global
    var Zdog = root.Zdog;
    Zdog.RoundedRect = factory( Zdog.Shape );
  }
}( this, function factory( Shape ) {

var RoundedRect = Shape.subclass({
  width: 1,
  height: 1,
  cornerRadius: 0.25,
  closed: false,
});

RoundedRect.type = 'RoundedRect';

RoundedRect.prototype.setPath = function() {
  /* eslint
     id-length: [ "error", { "min": 2, "exceptions": [ "x", "y" ] }],
     key-spacing: "off" */
  var xA = this.width / 2;
  var yA = this.height / 2;
  var shortSide = Math.min( xA, yA );
  var cornerRadius = Math.min( this.cornerRadius, shortSide );
  var xB = xA - cornerRadius;
  var yB = yA - cornerRadius;
  var path = [
    // top right corner
    { x: xB, y: -yA },
    { arc: [
      { x: xA, y: -yA },
      { x: xA, y: -yB },
    ] },
  ];
  // bottom right corner
  if ( yB ) {
    path.push({ x: xA, y: yB });
  }
  path.push({ arc: [
    { x: xA, y:  yA },
    { x: xB, y:  yA },
  ] });
  // bottom left corner
  if ( xB ) {
    path.push({ x: -xB, y: yA });
  }
  path.push({ arc: [
    { x: -xA, y:  yA },
    { x: -xA, y:  yB },
  ] });
  // top left corner
  if ( yB ) {
    path.push({ x: -xA, y: -yB });
  }
  path.push({ arc: [
    { x: -xA, y: -yA },
    { x: -xB, y: -yA },
  ] });

  // back to top right corner
  if ( xB ) {
    path.push({ x: xB, y: -yA });
  }

  this.path = path;
};

return RoundedRect;

} ) );
/**
 * Ellipse
 */

( function( root, factory ) {
  // module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory( require('./shape') );
  } else {
    // browser global
    var Zdog = root.Zdog;
    Zdog.Ellipse = factory( Zdog.Shape );
  }

}( this, function factory( Shape ) {

var Ellipse = Shape.subclass({
  diameter: 1,
  width: undefined,
  height: undefined,
  quarters: 4,
  closed: false,
});

Ellipse.type = 'Ellipse';

Ellipse.prototype.setPath = function() {
  var width = this.width != undefined ? this.width : this.diameter;
  var height = this.height != undefined ? this.height : this.diameter;
  var x = width/2;
  var y = height/2;
  this.path = [
    { x: 0, y: -y },
    { arc: [ // top right
      { x: x, y: -y },
      { x: x, y: 0 },
    ] },
  ];
  // bottom right
  if ( this.quarters > 1 ) {
    this.path.push({ arc: [
      { x: x, y: y },
      { x: 0, y: y },
    ] });
  }
  // bottom left
  if ( this.quarters > 2 ) {
    this.path.push({ arc: [
      { x: -x, y: y },
      { x: -x, y: 0 },
    ] });
  }
  // top left
  if ( this.quarters > 3 ) {
    this.path.push({ arc: [
      { x: -x, y: -y },
      { x: 0, y: -y },
    ] });
  }
};

return Ellipse;

} ) );
/**
 * Shape
 */

( function( root, factory ) {
  // module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory( require('./boilerplate'), require('./shape') );
  } else {
    // browser global
    var Zdog = root.Zdog;
    Zdog.Polygon = factory( Zdog, Zdog.Shape );
  }
}( this, function factory( utils, Shape ) {

var Polygon = Shape.subclass({
  sides: 3,
  radius: 0.5,
});

Polygon.type = 'Polygon';

var TAU = utils.TAU;

Polygon.prototype.setPath = function() {
  this.path = [];
  for ( var i = 0; i < this.sides; i++ ) {
    var theta = i / this.sides * TAU - TAU/4;
    var x = Math.cos( theta ) * this.radius;
    var y = Math.sin( theta ) * this.radius;
    this.path.push({ x: x, y: y });
  }
};

return Polygon;

} ) );
/**
 * Hemisphere composite shape
 */

( function( root, factory ) {
  // module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory( require('./boilerplate'), require('./vector'),
        require('./anchor'), require('./ellipse') );
  } else {
    // browser global
    var Zdog = root.Zdog;
    Zdog.Hemisphere = factory( Zdog, Zdog.Vector, Zdog.Anchor, Zdog.Ellipse );
  }
}( this, function factory( utils, Vector, Anchor, Ellipse ) {

var Hemisphere = Ellipse.subclass({
  fill: true,
});

Hemisphere.type = 'Hemisphere';

var TAU = utils.TAU;

Hemisphere.prototype.create = function( /* options */) {
  // call super
  Ellipse.prototype.create.apply( this, arguments );
  // composite shape, create child shapes
  this.apex = new Anchor({
    addTo: this,
    translate: { z: this.diameter / 2 },
  });
  // vector used for calculation
  this.renderCentroid = new Vector();
};

Hemisphere.prototype.updateSortValue = function() {
  // centroid of hemisphere is 3/8 between origin and apex
  this.renderCentroid.set( this.renderOrigin )
    .lerp( this.apex.renderOrigin, 3/8 );
  this.sortValue = this.renderCentroid.z;
};

Hemisphere.prototype.render = function( ctx, renderer ) {
  this.renderDome( ctx, renderer );
  // call super
  Ellipse.prototype.render.apply( this, arguments );
};

Hemisphere.prototype.renderDome = function( ctx, renderer ) {
  if ( !this.visible ) {
    return;
  }
  var elem = this.getDomeRenderElement( ctx, renderer );
  var contourAngle = Math.atan2( this.renderNormal.y, this.renderNormal.x );
  var domeRadius = this.diameter / 2 * this.renderNormal.magnitude();
  var x = this.renderOrigin.x;
  var y = this.renderOrigin.y;

  if ( renderer.isCanvas ) {
    // canvas
    var startAngle = contourAngle + TAU/4;
    var endAngle = contourAngle - TAU/4;
    ctx.beginPath();
    ctx.arc( x, y, domeRadius, startAngle, endAngle );
  } else if ( renderer.isSvg ) {
    // svg
    contourAngle = ( contourAngle - TAU/4 ) / TAU * 360;
    this.domeSvgElement.setAttribute( 'd', 'M ' + -domeRadius + ',0 A ' +
        domeRadius + ',' + domeRadius + ' 0 0 1 ' + domeRadius + ',0' );
    this.domeSvgElement.setAttribute( 'transform',
        'translate(' + x + ',' + y + ' ) rotate(' + contourAngle + ')' );
  }

  renderer.stroke( ctx, elem, this.stroke, this.color, this.getLineWidth() );
  renderer.fill( ctx, elem, this.fill, this.color );
  renderer.end( ctx, elem );
};

var svgURI = 'http://www.w3.org/2000/svg';

Hemisphere.prototype.getDomeRenderElement = function( ctx, renderer ) {
  if ( !renderer.isSvg ) {
    return;
  }
  if ( !this.domeSvgElement ) {
    // create svgElement
    this.domeSvgElement = document.createElementNS( svgURI, 'path' );
    this.domeSvgElement.setAttribute( 'stroke-linecap', 'round' );
    this.domeSvgElement.setAttribute( 'stroke-linejoin', 'round' );
  }
  return this.domeSvgElement;
};

return Hemisphere;

} ) );
/**
 * Cylinder composite shape
 */

( function( root, factory ) {
  // module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory( require('./boilerplate'),
        require('./path-command'), require('./shape'), require('./group'),
        require('./ellipse') );
  } else {
    // browser global
    var Zdog = root.Zdog;
    Zdog.Cylinder = factory( Zdog, Zdog.PathCommand, Zdog.Shape,
        Zdog.Group, Zdog.Ellipse );
  }
}( this, function factory( utils, PathCommand, Shape, Group, Ellipse ) {

function noop() {}

// ----- CylinderGroup ----- //

var CylinderGroup = Group.subclass({
  color: '#333',
  updateSort: true,
});

CylinderGroup.type = 'CylinderGroup';

CylinderGroup.prototype.create = function() {
  Group.prototype.create.apply( this, arguments );
  this.pathCommands = [
    new PathCommand( 'move', [ {} ] ),
    new PathCommand( 'line', [ {} ] ),
  ];
};

CylinderGroup.prototype.render = function( ctx, renderer ) {
  this.renderCylinderSurface( ctx, renderer );
  Group.prototype.render.apply( this, arguments );
};

CylinderGroup.prototype.renderCylinderSurface = function( ctx, renderer ) {
  if ( !this.visible ) {
    return;
  }
  // render cylinder surface
  var elem = this.getRenderElement( ctx, renderer );
  var frontBase = this.frontBase;
  var rearBase = this.rearBase;
  var scale = frontBase.renderNormal.magnitude();
  var strokeWidth = frontBase.diameter * scale + frontBase.getLineWidth();
  // set path command render points
  this.pathCommands[0].renderPoints[0].set( frontBase.renderOrigin );
  this.pathCommands[1].renderPoints[0].set( rearBase.renderOrigin );

  if ( renderer.isCanvas ) {
    ctx.lineCap = 'butt'; // nice
  }
  renderer.renderPath( ctx, elem, this.pathCommands );
  renderer.stroke( ctx, elem, true, this.color, strokeWidth );
  renderer.end( ctx, elem );

  if ( renderer.isCanvas ) {
    ctx.lineCap = 'round'; // reset
  }
};

var svgURI = 'http://www.w3.org/2000/svg';

CylinderGroup.prototype.getRenderElement = function( ctx, renderer ) {
  if ( !renderer.isSvg ) {
    return;
  }
  if ( !this.svgElement ) {
    // create svgElement
    this.svgElement = document.createElementNS( svgURI, 'path' );
  }
  return this.svgElement;
};

// prevent double-creation in parent.copyGraph()
// only create in Cylinder.create()
CylinderGroup.prototype.copyGraph = noop;

// ----- CylinderEllipse ----- //

var CylinderEllipse = Ellipse.subclass();

CylinderEllipse.prototype.copyGraph = noop;

// ----- Cylinder ----- //

var Cylinder = Shape.subclass({
  diameter: 1,
  length: 1,
  frontFace: undefined,
  fill: true,
});

Cylinder.type = 'Cylinder';


var TAU = utils.TAU;

Cylinder.prototype.create = function( /* options */) {
  // call super
  Shape.prototype.create.apply( this, arguments );
  // composite shape, create child shapes
  // CylinderGroup to render cylinder surface then bases
  this.group = new CylinderGroup({
    addTo: this,
    color: this.color,
    visible: this.visible,
  });
  var baseZ = this.length / 2;
  var baseColor = this.backface || true;
  // front outside base
  this.frontBase = this.group.frontBase = new Ellipse({
    addTo: this.group,
    diameter: this.diameter,
    translate: { z: baseZ },
    rotate: { y: TAU/2 },
    color: this.color,
    stroke: this.stroke,
    fill: this.fill,
    backface: utils.cloneColor(this.frontFace || baseColor),
    visible: this.visible,
  });
  // back outside base
  this.rearBase = this.group.rearBase = this.frontBase.copy({
    translate: { z: -baseZ },
    rotate: { y: 0 },
    backface: utils.cloneColor(baseColor),
  });
};

// Cylinder shape does not render anything
Cylinder.prototype.render = function() {};

// ----- set child properties ----- //

var childProperties = [ 'stroke', 'fill', 'color', 'visible' ];
childProperties.forEach( function( property ) {
  // use proxy property for custom getter & setter
  var _prop = '_' + property;
  Object.defineProperty( Cylinder.prototype, property, {
    get: function() {
      return this[ _prop ];
    },
    set: function( value ) {
      this[ _prop ] = value;
      // set property on children
      if ( this.frontBase ) {
        this.frontBase[ property ] = value;
        this.rearBase[ property ] = value;
        this.group[ property ] = value;
      }
    },
  } );
} );

// TODO child property setter for backface, frontBaseColor, & rearBaseColor

return Cylinder;

} ) );
/**
 * Cone composite shape
 */

( function( root, factory ) {
  // module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory( require('./boilerplate'), require('./vector'),
        require('./path-command'), require('./anchor'), require('./ellipse') );
  } else {
    // browser global
    var Zdog = root.Zdog;
    Zdog.Cone = factory( Zdog, Zdog.Vector, Zdog.PathCommand,
        Zdog.Anchor, Zdog.Ellipse );
  }
}( this, function factory( utils, Vector, PathCommand, Anchor, Ellipse ) {

var Cone = Ellipse.subclass({
  length: 1,
  fill: true,
});
Cone.type = 'Cone';

var TAU = utils.TAU;

Cone.prototype.create = function( /* options */) {
  // call super
  Ellipse.prototype.create.apply( this, arguments );
  // composite shape, create child shapes
  this.apex = new Anchor({
    addTo: this,
    translate: { z: this.length },
  });

  // vectors used for calculation
  this.renderApex = new Vector();
  this.renderCentroid = new Vector();
  this.tangentA = new Vector();
  this.tangentB = new Vector();

  this.surfacePathCommands = [
    new PathCommand( 'move', [ {} ] ), // points set in renderConeSurface
    new PathCommand( 'line', [ {} ] ),
    new PathCommand( 'line', [ {} ] ),
  ];
};

Cone.prototype.updateSortValue = function() {
  // center of cone is one third of its length
  this.renderCentroid.set( this.renderOrigin )
    .lerp( this.apex.renderOrigin, 1/3 );
  this.sortValue = this.renderCentroid.z;
};

Cone.prototype.render = function( ctx, renderer ) {
  this.renderConeSurface( ctx, renderer );
  Ellipse.prototype.render.apply( this, arguments );
};

Cone.prototype.renderConeSurface = function( ctx, renderer ) {
  if ( !this.visible ) {
    return;
  }
  this.renderApex.set( this.apex.renderOrigin )
    .subtract( this.renderOrigin );

  var scale = this.renderNormal.magnitude();
  var apexDistance = this.renderApex.magnitude2d();
  var normalDistance = this.renderNormal.magnitude2d();
  // eccentricity
  var eccenAngle = Math.acos( normalDistance/scale );
  var eccen = Math.sin( eccenAngle );
  var radius = this.diameter / 2 * scale;
  // does apex extend beyond eclipse of face
  var isApexVisible = radius * eccen < apexDistance;
  if ( !isApexVisible ) {
    return;
  }
  // update tangents
  var apexAngle = Math.atan2( this.renderNormal.y, this.renderNormal.x ) +
      TAU/2;
  var projectLength = apexDistance/eccen;
  var projectAngle = Math.acos( radius/projectLength );
  // set tangent points
  var tangentA = this.tangentA;
  var tangentB = this.tangentB;

  tangentA.x = Math.cos( projectAngle ) * radius * eccen;
  tangentA.y = Math.sin( projectAngle ) * radius;

  tangentB.set( this.tangentA );
  tangentB.y *= -1;

  tangentA.rotateZ( apexAngle );
  tangentB.rotateZ( apexAngle );
  tangentA.add( this.renderOrigin );
  tangentB.add( this.renderOrigin );

  this.setSurfaceRenderPoint( 0, tangentA );
  this.setSurfaceRenderPoint( 1, this.apex.renderOrigin );
  this.setSurfaceRenderPoint( 2, tangentB );

  // render
  var elem = this.getSurfaceRenderElement( ctx, renderer );
  renderer.renderPath( ctx, elem, this.surfacePathCommands );
  renderer.stroke( ctx, elem, this.stroke, this.color, this.getLineWidth() );
  renderer.fill( ctx, elem, this.fill, this.color );
  renderer.end( ctx, elem );
};

var svgURI = 'http://www.w3.org/2000/svg';

Cone.prototype.getSurfaceRenderElement = function( ctx, renderer ) {
  if ( !renderer.isSvg ) {
    return;
  }
  if ( !this.surfaceSvgElement ) {
    // create svgElement
    this.surfaceSvgElement = document.createElementNS( svgURI, 'path' );
    this.surfaceSvgElement.setAttribute( 'stroke-linecap', 'round' );
    this.surfaceSvgElement.setAttribute( 'stroke-linejoin', 'round' );
  }
  return this.surfaceSvgElement;
};

Cone.prototype.setSurfaceRenderPoint = function( index, point ) {
  var renderPoint = this.surfacePathCommands[ index ].renderPoints[0];
  renderPoint.set( point );
};

return Cone;

} ) );
/**
 * Horn composite shape
 */

( function( root, factory ) {
  // module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory( require('./boilerplate'),
        require('./path-command'), require('./shape'), require('./group'),
        require('./vector') );
  } else {
    // browser global
    var Zdog = root.Zdog;
    Zdog.Horn = factory( Zdog, Zdog.PathCommand, Zdog.Shape,
        Zdog.Group, Zdog.Vector );
  }
}( this, function factory( utils, PathCommand, Shape, Group, Vector ) {

function noop() {}

// ----- HornGroup ----- //

var HornGroup = Group.subclass({
  color: '#333',
  fill: true,
  stroke: true,
  updateSort: true,
});

HornGroup.type = 'HornGroup';

HornGroup.prototype.create = function() {
  Group.prototype.create.apply( this, arguments );

  // vectors used for calculation
  this.renderApex = new Vector();

  this.pathCommands = [
    new PathCommand( 'move', [ {} ] ),
    new PathCommand( 'line', [ {} ] ),
    new PathCommand( 'line', [ {} ] ),
    new PathCommand( 'line', [ {} ] ),
  ];
};

HornGroup.prototype.render = function( ctx, renderer ) {
  this.renderHornSurface( ctx, renderer );
  Group.prototype.render.apply( this, arguments );
};

HornGroup.prototype.renderHornSurface = function( ctx, renderer ) {
  if ( !this.visible ) {
    return;
  }
  // render horn surface
  var elem = this.getRenderElement( ctx, renderer );
  var scale = this.addTo.renderNormal.magnitude();
  var frontRadius = this.addTo.frontDiameter/2 * scale;
  var rearRadius = this.addTo.rearDiameter/2 * scale;
  this.renderApex.set( this.rearBase.renderOrigin )
    .subtract( this.frontBase.renderOrigin );

  var apexDistance = this.renderApex.magnitude2d();
  if ( apexDistance <= Math.abs( rearRadius - frontRadius ) ) {
    return;
  }

  var angle = Math.atan2( this.renderApex.y, this.renderApex.x );
  var angle2 = Math.acos((frontRadius - rearRadius) / apexDistance);

  var frontTangentA = this.pathCommands[0].renderPoints[0];
  var rearTangentA = this.pathCommands[1].renderPoints[0];
  var rearTangentB = this.pathCommands[2].renderPoints[0];
  var frontTangentB = this.pathCommands[3].renderPoints[0];

  frontTangentA.x = Math.cos( angle + angle2 ) * frontRadius;
  frontTangentA.y = Math.sin( angle + angle2 ) * frontRadius;
  rearTangentA.x = Math.cos( angle + angle2 ) * rearRadius;
  rearTangentA.y = Math.sin( angle + angle2 ) * rearRadius;

  frontTangentB.x = Math.cos( angle - angle2 ) * frontRadius;
  frontTangentB.y = Math.sin( angle - angle2 ) * frontRadius;
  rearTangentB.x = Math.cos( angle - angle2 ) * rearRadius;
  rearTangentB.y = Math.sin( angle - angle2 ) * rearRadius;

  frontTangentA.add( this.frontBase.renderOrigin );
  frontTangentB.add( this.frontBase.renderOrigin );
  rearTangentA.add( this.rearBase.renderOrigin );
  rearTangentB.add( this.rearBase.renderOrigin );

  if ( renderer.isCanvas ) {
    ctx.lineCap = 'butt'; // nice
  }
  renderer.renderPath( ctx, elem, this.pathCommands );
  renderer.stroke( ctx, elem, this.stroke, this.color, Shape.prototype.getLineWidth.apply(this) );
  renderer.fill( ctx, elem, this.fill, this.color );
  renderer.end( ctx, elem );

  if ( renderer.isCanvas ) {
    ctx.lineCap = 'round'; // reset
  }
};

var svgURI = 'http://www.w3.org/2000/svg';

HornGroup.prototype.getRenderElement = function( ctx, renderer ) {
  if ( !renderer.isSvg ) {
    return;
  }
  if ( !this.svgElement ) {
    // create svgElement
    this.svgElement = document.createElementNS( svgURI, 'path');
    this.svgElement.setAttribute( 'stroke-linecap', 'round' );
    this.svgElement.setAttribute( 'stroke-linejoin', 'round' );
  }
  return this.svgElement;
};

// prevent double-creation in parent.copyGraph()
// only create in Horn.create()
HornGroup.prototype.copyGraph = noop;

// ----- HornCap ----- //

var HornCap = Shape.subclass();

HornCap.type = 'HornCap';

HornCap.prototype.copyGraph = noop;

// ----- Horn ----- //

var Horn = Shape.subclass({
  frontDiameter: 1,
  rearDiameter: 1,
  length: 1,
  frontFace: undefined,
  fill: true,
});

Horn.type = 'Horn';

var TAU = utils.TAU;

Horn.prototype.create = function(/* options */) {
  // call super
  Shape.prototype.create.apply( this, arguments );
  // composite shape, create child shapes
  // HornGroup to render horn surface then bases
  this.group = new HornGroup({
    addTo: this,
    color: this.color,
    fill: this.fill,
    stroke: this.stroke,
    visible: this.visible,
  });
  var baseZ = this.length/2;
  var baseColor = this.backface || true;
  // front outside base
  this.frontBase = this.group.frontBase = new HornCap({
    addTo: this.group,
    translate: { z: (baseZ - this.frontDiameter/2) },
    rotate: { y: TAU/2 },
    color: this.color,
    stroke: this.frontDiameter + this.stroke,
    fill: this.fill,
    backface: this.frontFace || baseColor,
    visible: this.visible,
  });
  // back outside base
  this.rearBase = this.group.rearBase = new HornCap({
    addTo: this.group,
    translate: { z: (-baseZ + this.rearDiameter/2) },
    rotate: { y: 0 },
    color: this.color,
    stroke: this.rearDiameter + this.stroke,
    fill: this.fill,
    backface: baseColor,
    visible: this.visible,
  });

};

Horn.prototype.updateFrontCapDiameter = function(size) {
	this.frontBase.stroke = size + this.stroke;
	var baseZ = this.length/2;
	this.frontBase.translate.z = (baseZ - size/2);
}

Horn.prototype.updateRearCapDiameter = function(size) {
	this.rearBase.stroke = size + this.stroke;
	var baseZ = this.length/2;
	this.rearBase.translate.z = (-baseZ + size/2);
}

// Horn shape does not render anything
Horn.prototype.render = function() {};

// ----- set child properties ----- //

var childProperties = [ 'stroke', 'fill', 'color', 'visible',
                        'frontDiameter', 'rearDiameter' ];
childProperties.forEach( function( property ) {
  // use proxy property for custom getter & setter
  var _prop = '_' + property;
  Object.defineProperty( Horn.prototype, property, {
    get: function() {
      return this[ _prop ];
    },
    set: function( value ) {
      this[ _prop ] = value;
      // set property on children
      if ( this.frontBase ) {
		if (property === 'frontDiameter') {
		  this.updateFrontCapDiameter(value);
		}
		if (property === 'rearDiameter') {
		  this.updateRearCapDiameter(value);
		}
        this.frontBase[ property ] = value;
        this.rearBase[ property ] = value;
        this.group[ property ] = value;
      }
    },
  });
});

// TODO child property setter for backface, frontBaseColor, & rearBaseColor

return Horn;

}));
/**
 * Funnel composite shape
 */

( function( root, factory ) {
  // module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory( require('./boilerplate'),
        require('./path-command'), require('./shape'), require('./group'),
        require('./vector') );
  } else {
    // browser global
    var Zdog = root.Zdog;
    Zdog.Funnel = factory( Zdog, Zdog.PathCommand, Zdog.Shape, Zdog.Ellipse,
        Zdog.Group, Zdog.Vector );
  }
}( this, function factory( utils, PathCommand, Shape, Ellipse, Group, Vector ) {

function noop() {}

// ----- FunnelGroup ----- //

var FunnelGroup = Group.subclass({
  color: '#333',
  fill: true,
  stroke: true,
  updateSort: true,
});

FunnelGroup.type = 'FunnelGroup';

FunnelGroup.prototype.create = function() {
  Group.prototype.create.apply( this, arguments );

  // vectors used for calculation
  this.renderApex = new Vector();
  this.tangentFrontA = new Vector();
  this.tangentFrontB = new Vector();
  this.tangentRearA = new Vector();
  this.tangentRearB = new Vector();

  this.pathCommands = [
    new PathCommand( 'move', [ {} ] ),
    new PathCommand( 'line', [ {} ] ),
	new PathCommand( 'line', [ {} ] ),
	new PathCommand( 'line', [ {} ] ),
  ];
};

FunnelGroup.prototype.render = function( ctx, renderer ) {
  this.renderFunnelSurface( ctx, renderer );
  Group.prototype.render.apply( this, arguments );
};

FunnelGroup.prototype.renderFunnelSurface = function( ctx, renderer ) {
  if ( !this.visible ) {
    return;
  }
  // render funnel surface
  var elem = this.getRenderElement( ctx, renderer );
  var frontBase = this.frontBase;
  var frontDiameter = frontBase.diameter;
  var rearBase = this.rearBase;
  var rearDiameter = rearBase.diameter;
  var scale = frontBase.renderNormal.magnitude();
  var frontRadius = frontDiameter/2 * scale;
  var rearRadius = rearDiameter/2 * scale;

  this.renderApex.set( rearBase.renderOrigin )
    .subtract( frontBase.renderOrigin );

  // calculate tangents.
  var scale = frontBase.renderNormal.magnitude();
  var apexDistance = this.renderApex.magnitude2d();
  var normalDistance = frontBase.renderNormal.magnitude2d();
  // eccentricity
  var eccenAngle = Math.acos( normalDistance / scale );
  var biggerRadius =  (frontRadius > rearRadius) ? frontRadius : rearRadius;
  var eccenPercent;
  if (frontRadius == 0 || rearRadius == 0) {
	  eccenPercent = 1.0;
  } else {
	  eccenPercent = (Math.abs(frontRadius - rearRadius) / biggerRadius);
  }
  var eccen = Math.sin( eccenAngle ) * Math.sqrt(eccenPercent);
  // does apex extend beyond eclipse of face
  apexDistance = apexDistance + frontRadius/4 + rearRadius/4;
  var isApexVisible = frontRadius * eccen < apexDistance &&
                      rearRadius * eccen < apexDistance;
  if ( !isApexVisible ) {
    return;
  }
  // update tangents
  // TODO: try something more like horn_old.js updateSortValue()
  var apexAngle = Math.atan2( frontBase.renderNormal.y, frontBase.renderNormal.x ) +
      TAU/2;
  var projectFrontLength = (apexDistance + frontRadius) / eccen;
  var projectRearLength = (apexDistance + rearRadius) / eccen;
  var projectFrontAngle = Math.acos( frontRadius / projectFrontLength );
  var projectRearAngle = Math.acos( rearRadius / -projectRearLength );
  // set tangent points
  var tangentFrontA = this.tangentFrontA;
  var tangentFrontB = this.tangentFrontB;
  var tangentRearA = this.tangentRearA;
  var tangentRearB = this.tangentRearB;

  tangentFrontA.x = Math.cos( projectFrontAngle ) * frontRadius * eccen;
  tangentFrontA.y = Math.sin( projectFrontAngle ) * frontRadius;
  tangentRearA.x = Math.cos( projectRearAngle ) * rearRadius * eccen;
  tangentRearA.y = Math.sin( projectRearAngle ) * rearRadius;

  tangentFrontB.set( this.tangentFrontA );
  tangentFrontB.y *= -1;
  tangentRearB.set( this.tangentRearA );
  tangentRearB.y *= -1;

  tangentFrontA.rotateZ( apexAngle);
  tangentFrontB.rotateZ( apexAngle);
  tangentFrontA.add( frontBase.renderOrigin );
  tangentFrontB.add( frontBase.renderOrigin );
  tangentRearA.rotateZ( apexAngle + TAU/2);
  tangentRearB.rotateZ( apexAngle + TAU/2);
  tangentRearA.add( rearBase.renderOrigin );
  tangentRearB.add( rearBase.renderOrigin );


  // set path command render points
  this.pathCommands[0].renderPoints[0].set( tangentFrontA );
  this.pathCommands[1].renderPoints[0].set( tangentRearB );
  this.pathCommands[2].renderPoints[0].set( tangentRearA );
  this.pathCommands[3].renderPoints[0].set( tangentFrontB );

  if ( renderer.isCanvas ) {
    ctx.lineCap = 'butt'; // nice
  }
  renderer.stroke(ctx, elem, this.stroke, this.color, Shape.prototype.getLineWidth.apply(this));
  renderer.renderPath( ctx, elem, this.pathCommands );
  //renderer.stroke( ctx, elem, true, '#333', 0.1 ); // remove once testing is done.
  renderer.fill( ctx, elem, this.fill, this.color );
  renderer.end( ctx, elem );

  if ( renderer.isCanvas ) {
    ctx.lineCap = 'round'; // reset
  }
};

var svgURI = 'http://www.w3.org/2000/svg';

FunnelGroup.prototype.getRenderElement = function( ctx, renderer ) {
  if ( !renderer.isSvg ) {
    return;
  }
  if ( !this.svgElement ) {
    // create svgElement
    this.svgElement = document.createElementNS( svgURI, 'path');
    this.svgElement.setAttribute( 'stroke-linecap', 'round' );
    this.svgElement.setAttribute( 'stroke-linejoin', 'round' );
  }
  return this.svgElement;
};

// prevent double-creation in parent.copyGraph()
// only create in Funnel.create()
FunnelGroup.prototype.copyGraph = noop;

// ----- FunnelCap ----- //

var FunnelCap = Ellipse.subclass();

FunnelCap.type = 'FunnelCap';

FunnelCap.prototype.copyGraph = noop;

// ----- Funnel ----- //

var Funnel = Shape.subclass({
  frontDiameter: 1,
  rearDiameter: 1,
  length: 1,
  frontFace: undefined,
  fill: true,
});

Funnel.type = 'Funnel';

var TAU = utils.TAU;

Funnel.prototype.create = function(/* options */) {
  // call super
  Shape.prototype.create.apply( this, arguments );
  // composite shape, create child shapes
  // FunnelGroup to render funnel surface then bases
  this.group = new FunnelGroup({
    addTo: this,
    color: this.color,
    fill: this.fill,
    stroke: this.stroke,
    visible: this.visible,
  });
  var baseZ = this.length/2;
  var baseColor = this.backface || true;
  // front outside base
  this.frontBase = this.group.frontBase = new FunnelCap({
    addTo: this.group,
    translate: { z: (baseZ - this.frontDiameter/2) },
    rotate: { y: TAU/2 },
    color: this.color,
    diameter: this.frontDiameter,
    fill: this.fill,
    stroke: this.stroke,
    backface: this.frontFace || baseColor,
    visible: this.visible,
  });
  // back outside base
  this.rearBase = this.group.rearBase = new FunnelCap({
    addTo: this.group,
    translate: { z: (-baseZ + this.rearDiameter/2) },
    rotate: { y: 0 },
    color: this.color,
    diameter: this.rearDiameter,
    fill: this.fill,
    stroke: this.stroke,
    backface: baseColor,
    visible: this.visible,
  });

};

Funnel.prototype.updateFrontCapDiameter = function(size) {
	this.frontBase.diameter = size;
	var baseZ = this.length/2;
	this.frontBase.translate.z = (baseZ - size/2);
}

Funnel.prototype.updateRearCapDiameter = function(size) {
	this.rearBase.diameter = size;
	var baseZ = this.length/2;
	this.rearBase.translate.z = (-baseZ + size/2);
}

// Funnel shape does not render anything
Funnel.prototype.render = function() {};

// ----- set child properties ----- //

var childProperties = [ 'stroke', 'fill', 'color', 'visible',
                        'frontDiameter', 'rearDiameter' ];
childProperties.forEach( function( property ) {
  // use proxy property for custom getter & setter
  var _prop = '_' + property;
  Object.defineProperty( Funnel.prototype, property, {
    get: function() {
      return this[ _prop ];
    },
    set: function( value ) {
      this[ _prop ] = value;
      // set property on children
      if ( this.frontBase ) {
		if (property === 'frontDiameter') {
		  this.updateFrontCapDiameter(value);
		}
		if (property === 'rearDiameter') {
		  this.updateRearCapDiameter(value);
		}
        this.frontBase[ property ] = value;
        this.rearBase[ property ] = value;
        this.group[ property ] = value;
      }
    },
  });
});

// TODO child property setter for backface, frontBaseColor, & rearBaseColor

return Funnel;

}));
/**
 * Box composite shape
 */

( function( root, factory ) {
  // module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory( require('./boilerplate'), require('./anchor'),
        require('./shape'), require('./rect') );
  } else {
    // browser global
    var Zdog = root.Zdog;
    Zdog.Box = factory( Zdog, Zdog.Anchor, Zdog.Shape, Zdog.Rect );
  }
}( this, function factory( utils, Anchor, Shape, Rect ) {

// ----- BoxRect ----- //

var BoxRect = Rect.subclass();

// prevent double-creation in parent.copyGraph()
// only create in Box.create()
BoxRect.prototype.copyGraph = function() { };

// ----- Box ----- //

var TAU = utils.TAU;
var faceNames = [
  'frontFace',
  'rearFace',
  'leftFace',
  'rightFace',
  'topFace',
  'bottomFace',
];

var boxDefaults = utils.extend( {}, Shape.defaults );
delete boxDefaults.path;
faceNames.forEach( function( faceName ) {
  boxDefaults[ faceName ] = true;
} );
utils.extend( boxDefaults, {
  width: 1,
  height: 1,
  depth: 1,
  fill: true
}, Shape.defaults );
delete boxDefaults.path;

var Box = Anchor.subclass( boxDefaults );
Box.ignoreKeysJSON = [ 'children' ];
Box.type = 'Box';

/* eslint-disable no-self-assign */
Box.prototype.create = function( options ) {
  Anchor.prototype.create.call( this, options );
  this.updatePath();
  // HACK reset fill to trigger face setter
  this.fill = this.fill;
};

Box.prototype.updatePath = function() {
  // reset all faces to trigger setters
  faceNames.forEach( function( faceName ) {
    this[ faceName ] = this[ faceName ];
  }, this );
};
/* eslint-enable no-self-assign */

faceNames.forEach( function( faceName ) {
  var _faceName = '_' + faceName;
  Object.defineProperty( Box.prototype, faceName, {
    get: function() {
      return this[ _faceName ];
    },
    set: function( value ) {
      this[ _faceName ] = value;
      this.setFace( faceName, value );
    },
  } );
} );

Box.prototype.setFace = function( faceName, value ) {
  var rectProperty = faceName + 'Rect';
  var rect = this[ rectProperty ];
  // remove if false
  if ( !value ) {
    this.removeChild( rect );
    return;
  }
  // update & add face
  var options = this.getFaceOptions( faceName );
  if (utils.isColor(value)) {
    options.color = value;
  } else {
    options.color = utils.cloneColor(this.color);
  }

  if ( rect ) {
    // update previous
    rect.setOptions( options );
  } else {
    // create new
    rect = this[ rectProperty ] = new BoxRect( options );
  }
  rect.updatePath();
  this.addChild( rect );
};

Box.prototype.getFaceOptions = function( faceName ) {
  return {
    frontFace: {
      width: this.width,
      height: this.height,
      translate: { z: this.depth / 2 },
    },
    rearFace: {
      width: this.width,
      height: this.height,
      translate: { z: -this.depth / 2 },
      rotate: { y: TAU/2 },
    },
    leftFace: {
      width: this.depth,
      height: this.height,
      translate: { x: -this.width / 2 },
      rotate: { y: -TAU/4 },
    },
    rightFace: {
      width: this.depth,
      height: this.height,
      translate: { x: this.width / 2 },
      rotate: { y: TAU/4 },
    },
    topFace: {
      width: this.width,
      height: this.depth,
      translate: { y: -this.height / 2 },
      rotate: { x: -TAU/4 },
    },
    bottomFace: {
      width: this.width,
      height: this.depth,
      translate: { y: this.height / 2 },
      rotate: { x: TAU/4 },
    },
  }[ faceName ];
};

// ----- set face properties ----- //

var childProperties = [ 'color', 'stroke', 'fill', 'backface', 'front',
  'visible' ];
childProperties.forEach( function( property ) {
  // use proxy property for custom getter & setter
  var _prop = '_' + property;
  Object.defineProperty( Box.prototype, property, {
    get: function() {
      return this[ _prop ];
    },
    set: function( value ) {
      this[ _prop ] = value;
      faceNames.forEach( function( faceName ) {
        var rect = this[ faceName + 'Rect' ];
        var isFaceColor = typeof this[ faceName ] == 'string';
        var isColorUnderwrite = property == 'color' && isFaceColor;
        if ( rect && !isColorUnderwrite ) {
          rect[ property ] = value;
        }
      }, this );
    },
  } );
} );

return Box;

} ) );
/**
 * Texture
 */
( function( root, factory ) {
    // module definition
    if ( typeof module == 'object' && module.exports ) {
      // CommonJS
      module.exports = factory(require('./vector'));
    } else {
      // browser global
      var Zdog = root.Zdog;
      Zdog.Texture = factory(Zdog.Vector);
    }
  }( this, function factory(Vector) {

  /**
   * Calculates the inverse of the matrix:
   *  | x1 x2 x3 |
   *  | y1 y2 y3 |
   *  |  1  1  1 |
   */
  function inverse(x1, y1, x2, y2, x3, y3) {
    let tp = [
      y2 - y3, x3 - x2, x2*y3 - x3*y2,
      y3 - y1, x1 - x3, x3*y1 - x1*y3,
      y1 - y2, x2 - x1, x1*y2 - x2*y1];
    let det = tp[2] + tp[5] + tp[8];
    return tp.map(function(x) { return x / det;});
  }

  function parsePointMap(size, map) {
    if (!Array.isArray(map) || !map.length) {
      map = [0, 0, size[0], size[1]];
    }
    if (typeof(map[0]) == "number") {
      if (map.length < 4) {
        let tmp = map;
        map = [0, 0, size[0], size[1]];
        for (let i = 0; i < tmp.length; i++) {
          map[i] = tmp[i];
        }
      }
      return [
          new Vector({x:map[0], y:map[1], z:1}),
          new Vector({x:map[0] + map[2], y:map[1], z:1}),
          new Vector({x:map[0], y:map[1] + map[3], z:1})
        ];
    } else {
      return [new Vector(map[0]), new Vector(map[1]), new Vector(map[2])];
    }
  }

  var idCounter = 0;

  const optionKeys = [
    'img',
    'linearGrad',
    'radialGrad',
    'colorStops',
    'src',
    'dst'
  ]

  /**
   * Creates a tecture map. Possible options:
   *    img: Image object to be used as texture
   *    linearGrad: [x1, y1, x2, y2]  Array defining the linear gradient
   *    radialGrad: [x0, y0, r0, x1, y1, r1] Array defining the radial gradient
   *    colorStops: [offset1, color1, offset2, color2...] Array defining the color
   *                stops for the gradient, offset must be in range [0, 1]
   *
   *    src: <surface definition> Represents the surface for the texture. Above
   *         gradient definition should be represented in this coordinate space
   *    dst: <surface definition> Represents the surface of the object. This allows
   *         keeping the texture definition independent of the surface definition
   *
   *   <surface definition> Can be represented in one of the following ways:
   *     [x, y, width, height] => We use 3 points top-left, top-right, bottom-left
   *     [x, y] => image/gradient size is used for width and height with the above rule
   *     [vector, vector, vector] => provided points are used
   */
  function Texture(options) {
    this.id = idCounter++;
    this.isTexture = true;

    options = options || { }
    for (var key in options ) {
      if (optionKeys.indexOf( key ) != -1 ) {
        this[key] = options[key];
      }
    }

    var size;
    if (options.img) {
      size = [options.img.width, options.img.height];
    } else if (options.linearGrad) {
      size = [Math.abs(options.linearGrad[2] - options.linearGrad[0]), Math.abs(options.linearGrad[3] - options.linearGrad[1])];
    } else if (options.radialGrad) {
      size = [Math.abs(options.radialGrad[3] - options.radialGrad[0]), Math.abs(options.radialGrad[4] - options.radialGrad[1])];
    } else {
      throw "One of [img, linearGrad, radialGrad] is required";
    }
    if (size[0] == 0) size[0] = size[1];
    if (size[1] == 0) size[1] = size[0];

    this.src = parsePointMap(size, options.src);
    this.dst = parsePointMap(size, options.dst);

    this.srcInverse = inverse(
      this.src[0].x, this.src[0].y,
      this.src[1].x, this.src[1].y,
      this.src[2].x, this.src[2].y);
    this.p1 = new Vector();
    this.p2 = new Vector();
    this.p3 = new Vector();
    this.matrix = [0, 0, 0, 0, 0, 0];
  };

  Texture.prototype.getMatrix = function() {
    let m = this.matrix;
    let inverse = this.srcInverse;
    m[0] = this.p1.x * inverse[0] + this.p2.x * inverse[3] + this.p3.x * inverse[6];
    m[1] = this.p1.y * inverse[0] + this.p2.y * inverse[3] + this.p3.y * inverse[6];
    m[2] = this.p1.x * inverse[1] + this.p2.x * inverse[4] + this.p3.x * inverse[7];
    m[3] = this.p1.y * inverse[1] + this.p2.y * inverse[4] + this.p3.y * inverse[7];
    m[4] = this.p1.x * inverse[2] + this.p2.x * inverse[5] + this.p3.x * inverse[8];
    m[5] = this.p1.y * inverse[2] + this.p2.y * inverse[5] + this.p3.y * inverse[8];
    return m;
  }

  Texture.prototype.getCanvasFill = function(ctx) {
    if (!this.pattern) {
      if (this.img) {
        this.pattern = ctx.createPattern(this.img, "repeat");
      } else {
        this.pattern = this.linearGrad
          ? ctx.createLinearGradient.apply(ctx, this.linearGrad)
          : ctx.createRadialGradient.apply(ctx, this.radialGrad);
        if (this.colorStops) {
          for (var i = 0; i < this.colorStops.length; i+=2) {
            this.pattern.addColorStop(this.colorStops[i], this.colorStops[i+1]);
          }
        }
      }
    }
    // pattern.setTransform is not supported in IE,
    // so transform the context instead
    ctx.transform.apply(ctx, this.getMatrix());
    return this.pattern;
  };

  const svgURI = 'http://www.w3.org/2000/svg';
  Texture.prototype.getSvgFill = function(svg) {
    if (!this.svgPattern) {
      if (this.img) {
        this.svgPattern = document.createElementNS( svgURI, 'pattern');
        this.svgPattern.setAttribute("width", this.img.width);
        this.svgPattern.setAttribute("height", this.img.height);
        this.svgPattern.setAttribute("patternUnits", "userSpaceOnUse");
        this.attrTransform = "patternTransform";

        let img = document.createElementNS( svgURI, 'image');
        img.setAttribute("href", this.img.src);
        this.svgPattern.appendChild(img);
      } else {
        var type, vals, keys;
        if (this.linearGrad) {
          type = "linearGradient";
          vals = this.linearGrad;
          keys = ["x1", "y1", "x2", "y2"]
        } else {
          type = "radialGradient";
          vals = this.radialGrad;
          keys = ["fx", "fy", "fr", "cx", "cy", "r"]
        }
        this.svgPattern = document.createElementNS( svgURI, type);
        for (var i = 0; i < keys.length; i++) {
          this.svgPattern.setAttribute(keys[i], vals[i]);
        }

        if (this.colorStops) {
          for (var i = 0; i < this.colorStops.length; i+=2) {
            let colorStop = document.createElementNS(svgURI, 'stop' );
            colorStop.setAttribute("offset", this.colorStops[i]);
            colorStop.setAttribute("style", "stop-color:" + this.colorStops[i+1]);
            this.svgPattern.appendChild(colorStop);
          }
        }
        this.svgPattern.setAttribute("gradientUnits", "userSpaceOnUse");
        this.attrTransform = "gradientTransform";
      }
      this.svgPattern.setAttribute("id", "texture_" + this.id);
      this._svgUrl = 'url(#texture_' + this.id + ')';

      this.defs = document.createElementNS(svgURI, 'defs' );
      this.defs.appendChild(this.svgPattern);
    }

    this.svgPattern.setAttribute(this.attrTransform, 'matrix(' + this.getMatrix().join(' ') + ')');
    svg.appendChild( this.defs );
    return this._svgUrl;
  }

  // ----- update ----- //
  Texture.prototype.reset = function() {
    this.p1.set(this.dst[0]);
    this.p2.set(this.dst[1]);
    this.p3.set(this.dst[2]);
  };

  Texture.prototype.transform = function( translation, rotation, scale ) {
    this.p1.transform(translation, rotation, scale);
    this.p2.transform(translation, rotation, scale);
    this.p3.transform(translation, rotation, scale);
  };

  Texture.prototype.clone = function() {
    return new Texture(this);
  };

  return Texture;
} ) );
/**
 * Index
 */

( function( root, factory ) {
  // module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
        require('./boilerplate'),
        require('./canvas-renderer'),
        require('./svg-renderer'),
        require('./vector'),
        require('./anchor'),
        require('./dragger'),
        require('./illustration'),
        require('./path-command'),
        require('./shape'),
        require('./group'),
        require('./rect'),
        require('./rounded-rect'),
        require('./ellipse'),
        require('./polygon'),
        require('./hemisphere'),
        require('./cylinder'),
        require('./cone'),
        require('./horn'),
        require('./funnel'),
        require('./box'),
        require('./texture')
    );
  } else if ( typeof define == 'function' && define.amd ) {
    /* globals define */ // AMD
    define( 'zdog', [], root.Zdog );
  }
/* eslint-disable max-params */
} )( this, function factory( Zdog, CanvasRenderer, SvgRenderer, Vector, Anchor,
    Dragger, Illustration, PathCommand, Shape, Group, Rect, RoundedRect,
    Ellipse, Polygon, Hemisphere, Cylinder, Cone, Horn, Funnel, Box, Texture ) {
/* eslint-enable max-params */

      Zdog.CanvasRenderer = CanvasRenderer;
      Zdog.SvgRenderer = SvgRenderer;
      Zdog.Vector = Vector;
      Zdog.Anchor = Anchor;
      Zdog.Dragger = Dragger;
      Zdog.Illustration = Illustration;
      Zdog.PathCommand = PathCommand;
      Zdog.Shape = Shape;
      Zdog.Group = Group;
      Zdog.Rect = Rect;
      Zdog.RoundedRect = RoundedRect;
      Zdog.Ellipse = Ellipse;
      Zdog.Polygon = Polygon;
      Zdog.Hemisphere = Hemisphere;
      Zdog.Cylinder = Cylinder;
      Zdog.Cone = Cone;
      Zdog.Horn = Horn;
      Zdog.Funnel = Funnel;
      Zdog.Box = Box;
      Zdog.Texture = Texture;

      return Zdog;
} );
