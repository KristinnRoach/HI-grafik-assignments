// create an object encapsulating state for a draw call — shaders, buffers, attributes, uniforms
export function createDrawState(
  gl,
  {
    vert,
    frag,
    attributes,
    indices,
    nrVertices,
    offset = 0,
    type = gl.TRIANGLES,
  }
) {
  const program = createProgram(gl, vert, frag);
  const uniforms = getUniformLocations(gl, program);
  const vao = createVertexArray(gl, program, attributes, indices);
  if (!nrVertices && ArrayBuffer.isView(indices)) nrVertices = indices.length;

  return {
    uniforms,
    use() {
      gl.useProgram(program);
      gl.bindVertexArray(vao);
    },
    draw() {
      if (indices) {
        gl.drawElements(type, nrVertices, gl.UNSIGNED_SHORT, offset);
      } else {
        gl.drawArrays(type, offset, nrVertices);
      }
    },
  };
}

// compile shaders and link into a program
export function createProgram(gl, vertexSrc, fragmentSrc) {
  const vert = gl.createShader(gl.VERTEX_SHADER);
  const frag = gl.createShader(gl.FRAGMENT_SHADER);

  const pragma = '#version 300 es\n';
  gl.shaderSource(vert, pragma + vertexSrc);
  gl.shaderSource(frag, pragma + fragmentSrc);

  gl.compileShader(vert);
  gl.compileShader(frag);

  const program = gl.createProgram();
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const progLog = gl.getProgramInfoLog(program);
    const vertLog = gl.getShaderInfoLog(vert);
    const fragLog = gl.getShaderInfoLog(frag);
    throw new Error([progLog, vertLog, fragLog].filter(Boolean).join('\n'));
  }

  gl.deleteShader(vert);
  gl.deleteShader(frag);

  return program;
}

// create a vertex array object with the given attribute layout and vertex/index buffers
export function createVertexArray(gl, program, attributes, indices) {
  const vao = gl.createVertexArray();
  const names = Object.keys(attributes);

  gl.bindVertexArray(vao);

  for (let i = 0; i < names.length; i++) {
    let {
      size = 1,
      type = gl.FLOAT,
      normalize = false,
      stride = 0,
      offset = 0,
      buffer,
      data,
    } = attributes[names[i]];

    if (data && !buffer) buffer = createBuffer(gl, data);

    gl.bindAttribLocation(program, i, names[i]);
    gl.enableVertexAttribArray(i);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(i, size, type, normalize, stride, offset);
  }

  if (indices) {
    if (ArrayBuffer.isView(indices)) indices = createIndexBuffer(gl, indices);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
  }

  return vao;
}

// create an array buffer with data
export function createBuffer(
  gl,
  data,
  usage = gl.STATIC_DRAW,
  type = gl.ARRAY_BUFFER
) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(type, buffer);
  gl.bufferData(type, data, usage);
  return buffer;
}

// create an index buffer
export function createIndexBuffer(gl, data, usage = gl.STATIC_DRAW) {
  return createBuffer(gl, data, usage, gl.ELEMENT_ARRAY_BUFFER);
}

// get an object with all uniform locations for a program for easy access
export function getUniformLocations(gl, program) {
  const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  const locations = {};
  for (let i = 0; i < numUniforms; i++) {
    const { name } = gl.getActiveUniform(program, i);
    locations[name] = gl.getUniformLocation(program, name);
  }
  return locations;
}

// set up a requestAnimationFrame-based render loop, also handling resource disposal
export function animate(gl, fn) {
  let frameId = requestAnimationFrame(function draw() {
    fn();
    frameId = requestAnimationFrame(draw);
  });
  Inputs.disposal(gl.canvas).then(() => {
    cancelAnimationFrame(frameId);
    gl.getExtension('WEBGL_lose_context').loseContext();
  });
  return gl.canvas;
}
