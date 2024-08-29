var gl;
var points;

var numVertices = 7;

window.onload = function init() {
  var canvas = document.getElementById('gl-canvas');

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  var vertices = new Float32Array([
    -0.75,
    -0.75, // bottom-left

    0.45,
    -0.75, //bottom-right

    0.45,
    -0.35, // mid-right

    -0.35,
    -0.35, // center

    -0.75,
    -0.75, // bottom-left aftur!

    -0.35,
    0.75, // top-right

    -0.75,
    0.75, // top-left
  ]);

  //  Configure WebGL

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  //  Load shaders and initialize attribute buffers

  var program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);

  // Load the data into the GPU

  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Associate out shader variables with our data buffer

  var vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  render();
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, numVertices);
}
