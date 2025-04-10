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
