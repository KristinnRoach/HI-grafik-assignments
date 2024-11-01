export default {
  base: '/hi-grafik-assignments/src/v3-frogger-vite/', // needs to be lowercase
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist', // 'dist' to match the GitHub Actions script
    emptyOutDir: true, // ensure clean builds
  },
};
