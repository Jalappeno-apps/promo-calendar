const path = require('path')
const envFilePlugin = require('esbuild-envfile-plugin');
const esbuild = require('esbuild');

esbuild.context({
  logLevel: 'info',
  entryPoints: ['application.js'],
  bundle: true,
  sourcemap: true,
  outdir: path.join(process.cwd(), "app/assets/builds"),
  absWorkingDir: path.join(process.cwd(), "app/javascript"),
  publicPath: 'assets',
  loader: {
    '.png': 'file',
    '.svg': 'file',
    '.jpeg': 'file',
    '.jpg': 'file',
  },
  plugins: [envFilePlugin],
}).catch(() => process.exit(1));
// uncomment on dev build
// .then((r) => {
//   console.log('✨ Build succeeded.');

//   r.watch();[
//   console.log('watching.]..');
// })
// 
