const fs = require('fs');
const execSync = require('child_process').execSync;

// get file paths from index.js
const indexPath = 'js/index.js';
let indexSrc = fs.readFileSync( `./${indexPath}`, 'utf8' );
// Updated regex to match the actual format
let cjsBlockRegex = /module\.exports = factory\(([\s\S]*?)\);/i;
let cjsBlockMatch = indexSrc.match( cjsBlockRegex );

if (!cjsBlockMatch) {
  throw new Error('Could not find CommonJS module exports in index.js');
}

let paths = cjsBlockMatch[0].match( /require\('([.\-/\w]+)'\)/gi );

if (!paths) {
  throw new Error('Could not find any require statements in module exports');
}

paths = paths.map( function( path ) {
  return path.replace( "require('.", 'js' ).replace( "')", '.js' );
} );
paths.push( indexPath );

execSync(`cat ${paths.join(' ')} > dist/zdog.dist.js`);

console.log('bundled dist/zdog.dist.js');
