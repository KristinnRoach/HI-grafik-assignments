'use strict';

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 5;

window.onload = function init() {
  canvas = document.getElementById('gl-canvas');

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  //  Init data for carpet

  divideSquare(-1, -1, 2, NumTimesToSubdivide);

  //
  //  Configure WebGL
  //
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  //  Load shaders and initialize attribute buffers

  var program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);

  // Load the data into the GPU

  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  // Associate out shader variables with our data buffer

  var vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  render();
};

function triangle(a, b, c) {
  points.push(a, b, c);
}

function divideSquare(x, y, size, count) {
  if (count === 0) {
    // Draw a filled square at this position
    square(x, y, size);
  } else {
    var newSize = size / 3;
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        // Skip the center square
        if (i === 1 && j === 1) continue;

        divideSquare(x + i * newSize, y + j * newSize, newSize, count - 1);
      }
    }
  }
}

function square(x, y, size) {
  points.push(
    vec2(x, y),
    vec2(x, y + size),
    vec2(x + size, y + size),
    vec2(x, y),
    vec2(x + size, y + size),
    vec2(x + size, y)
  );
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, points.length);
}

// function divideTriangle(a, b, c, count) {
//   // check for end of recursion

//   if (count === 0) {
//     triangle(a, b, c);
//   } else {
//     //bisect the sides

//     var ab = mix(a, b, 0.5);
//     var ac = mix(a, c, 0.5);
//     var bc = mix(b, c, 0.5);

//     --count;

//     // three new triangles

//     divideTriangle(a, ab, ac, count);
//     divideTriangle(c, ac, bc, count);
//     divideTriangle(b, bc, ab, count);
//   }
// }

// function divideSquare(a, b, c, d, count) {
//   // check for end of recursion

//   if (count === 0) {
//     square(a, b, c, d);
//   } else {
//     //bisect the sides

//     var ab = mix(a, b, 0.5);
//     var bc = mix(b, c, 0.5);
//     var cd = mix(c, d, 0.5);
//     var da = mix(d, a, 0.5);
//     var mid = mix(a, c, 0.5);

//     --count;

//     // four new squares

//     divideSquare(a, ab, mid, da, count);
//     divideSquare(ab, b, bc, mid, count);
//     divideSquare(mid, bc, c, cd, count);
//     divideSquare(da, mid, cd, d, count);
//   }
// }

// function square(a, b, c, d) {
//   points.push(a, b, c);
//   points.push(a, c, d);
// }
