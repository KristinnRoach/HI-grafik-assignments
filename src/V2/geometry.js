// geometry.js

export let points = [];
export let colors = [];

const randomAlpha = () => Math.random().toFixed(3) + 0.01;

const randomRGBA = () => [
  // create a more controlled semi-random color function
  Math.random(),
  Math.random(),
  Math.random(),
  randomAlpha(),
];

export function createCubeGeometry() {
  const vertices = [
    [-0.5, -0.5, 0.5],
    [-0.5, 0.5, 0.5],
    [0.5, 0.5, 0.5],
    [0.5, -0.5, 0.5],
    [-0.5, -0.5, -0.5],
    [-0.5, 0.5, -0.5],
    [0.5, 0.5, -0.5],
    [0.5, -0.5, -0.5],
  ];
  const vertexColors = [
    [0.0, 0.0, 0.0, randomAlpha()],
    [1.0, 0.0, 0.0, randomAlpha()],
    [1.0, 1.0, 0.0, randomAlpha()],
    [0.0, 1.0, 0.0, randomAlpha()],
    [0.0, 0.0, 1.0, randomAlpha()],
    [1.0, 0.0, 1.0, randomAlpha()],
    [0.0, 1.0, 1.0, randomAlpha()],
    [1.0, 1.0, 1.0, randomAlpha()],
  ];

  console.log('vertexColors:', vertexColors);
  const faces = [
    [1, 0, 3, 2],
    [2, 3, 7, 6],
    [3, 0, 4, 7],
    [6, 5, 1, 2],
    [4, 5, 6, 7],
    [5, 4, 0, 1],
  ];

  faces.forEach((face) => {
    const [a, b, c, d] = face;
    const indices = [a, b, c, a, c, d];
    indices.forEach((i) => {
      points.push(vertices[i]);
      colors.push(vertexColors[a]);
    });
  });
}
