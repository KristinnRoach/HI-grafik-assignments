var canvas;
var gl;

var maxNumCircles = 50;
var numCirclePoints = 22;
var index = 0;

var vBuffer; // should rather be passed as an argument?

window.onload = function init() {
  canvas = document.getElementById('gl-canvas');
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) alert("WebGL isn't available");

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 0.0);

  //  Load shaders and initialize attribute buffers
  var program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);

  vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

  // taka frá pláss
  gl.bufferData(
    gl.ARRAY_BUFFER,
    8 * numCirclePoints * maxNumCircles,
    gl.DYNAMIC_DRAW
  );

  var vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  canvas.addEventListener('mousedown', addCircle);
};

function addCircle(e) {
  if (index >= maxNumCircles) return;

  var rect = e.target.getBoundingClientRect();
  var centerPos = [
    (2 * (e.clientX - rect.left)) / rect.width - 1,
    (2 * (rect.height - (e.clientY - rect.top))) / rect.height - 1,
  ];
  var radius = Math.random() * 0.1 + 0.001;
  var newCirclePoints = createCirclePoints(centerPos, radius);

  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferSubData(
    gl.ARRAY_BUFFER,
    8 * numCirclePoints * index,
    newCirclePoints
  );
  index++;

  render();
}

function createCirclePoints(centerPos, rad) {
  var newCirclePoints = new Float32Array(numCirclePoints * 2);

  newCirclePoints[0] = centerPos[0];
  newCirclePoints[1] = centerPos[1];

  var k = numCirclePoints - 2; // nr of points around the circle
  var dAngle = (2 * Math.PI) / k;
  for (var i = 0; i <= k; i++) {
    var a = i * dAngle;
    var idx = (i + 1) * 2;
    newCirclePoints[idx] = rad * Math.cos(a) + centerPos[0];
    newCirclePoints[idx + 1] = rad * Math.sin(a) + centerPos[1];
  }
  return newCirclePoints;
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  for (var i = 0; i < index; i++) {
    gl.drawArrays(gl.TRIANGLE_FAN, i * numCirclePoints, numCirclePoints);
  }
}
