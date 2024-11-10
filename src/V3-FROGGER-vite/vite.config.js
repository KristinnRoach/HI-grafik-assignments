export default {
  base: '/hi-grafik-assignments/src/v3-frogger-vite/', // Simpler path, lowercase needed
  root: '.',
  publicDir: '../public',
  build: {
    outDir: '../dist', // 'dist' to match the GitHub Actions script
    emptyOutDir: true, // ensure clean builds
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
    },
  },
  assetsInclude: ['**/*.glb'], // Ensure Vite handles GLB files correctly
};
