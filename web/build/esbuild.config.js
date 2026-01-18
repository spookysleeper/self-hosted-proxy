const esbuild = require('esbuild');
const path = require('path');

const isWatch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: {
    'runtime.min': path.join(__dirname, '../src/runtime/index.js'),
    'admin.min': path.join(__dirname, '../src/admin/index.js'),
  },
  bundle: true,
  minify: true,
  sourcemap: true,
  outdir: path.join(__dirname, '../dist'),
  target: ['es2015'],
  format: 'iife',
  logLevel: 'info',
};

if (isWatch) {
  esbuild.context(buildOptions).then(ctx => {
    ctx.watch();
    console.log('👀 Watching for changes...');
  });
} else {
  esbuild.build(buildOptions).then(() => {
    console.log('✅ Build complete!');
  }).catch(() => process.exit(1));
}
