import {
  vec3,
  translate,
  rotateX,
  rotateY,
  rotateZ,
  mat4,
  flatten,
  mult,
  scalem,
} from '../../lib/MV.js';
import { initShaders } from '../../lib/initShaders.js';
import { getGL, getCanvas } from '../../lib/init-gl2.js';

const canvas = getCanvas();
const gl = getGL();
const numVertices = 36;

let program;

let points = [];
let colors = [];

let movement = false;
let spinX = 0;
let spinY = 0;
let orgX;
let orgY;

let uTransformMatrix;

let aColor;
let aPosition;

window.onload = function init() {
  colorCube();

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.8, 0.9, 1.0, 1.0);

  gl.enable(gl.DEPTH_TEST);

  program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  aColor = gl.getAttribLocation(program, 'aColor');
  gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aColor);

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  aPosition = gl.getAttribLocation(program, 'aPosition');
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  uTransformMatrix = gl.getUniformLocation(program, 'uTransform');

  //event listeners for mouse
  canvas.addEventListener('mousedown', function (e) {
    movement = true;
    orgX = e.offsetX;
    orgY = e.offsetY;
    e.preventDefault(); // Disable drag and drop
  });

  canvas.addEventListener('mouseup', function (e) {
    movement = false;
  });

  canvas.addEventListener('mousemove', function (e) {
    if (movement) {
      spinY = (spinY + (orgX - e.offsetX)) % 360;
      spinX = (spinX + (orgY - e.offsetY)) % 360;
      orgX = e.offsetX;
      orgY = e.offsetY;
    }
  });

  render();
};

function colorCube() {
  quad(1, 0, 3, 2);
  quad(2, 3, 7, 6);
  quad(3, 0, 4, 7);
  quad(6, 5, 1, 2);
  quad(4, 5, 6, 7);
  quad(5, 4, 0, 1);
}

function quad(a, b, c, d) {
  var vertices = [
    vec3(-0.5, -0.5, 0.5),
    vec3(-0.5, 0.5, 0.5),
    vec3(0.5, 0.5, 0.5),
    vec3(0.5, -0.5, 0.5),
    vec3(-0.5, -0.5, -0.5),
    vec3(-0.5, 0.5, -0.5),
    vec3(0.5, 0.5, -0.5),
    vec3(0.5, -0.5, -0.5),
  ];

  var vertexColors = [
    [0.0, 0.0, 0.0, 1.0], // black
    [1.0, 0.0, 0.0, 1.0], // red
    [1.0, 1.0, 0.0, 1.0], // yellow
    [0.0, 1.0, 0.0, 1.0], // green
    [0.0, 0.0, 1.0, 1.0], // blue
    [1.0, 0.0, 1.0, 1.0], // magenta
    [0.0, 1.0, 1.0, 1.0], // cyan
    [1.0, 1.0, 1.0, 1.0], // white
  ];

  // We need to parition the quad into two triangles in order for
  // WebGL to be able to render it.  In this case, we create two
  // triangles from the quad indices

  //vertex color assigned by the index of the vertex

  var indices = [a, b, c, a, c, d];

  for (var i = 0; i < indices.length; ++i) {
    points.push(vertices[indices[i]]);
    colors.push(vertexColors[a]);
  }
}
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let mv = mat4();

  mv = mult(mv, translate(0.0, 0.0, 0.0));
  // mv = mult(mv, rotateZ(90));
  mv = mult(mv, scalem(1.0, 1.0, 1.0));

  mv = mult(mv, scalem(0.5, 0.75, 0.25));
  gl.uniformMatrix4fv(uTransformMatrix, false, flatten(mv));
  gl.drawArrays(gl.TRIANGLE_FAN, 0, numVertices);

  requestAnimationFrame(render);
}
