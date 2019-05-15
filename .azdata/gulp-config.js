var path = require('path');
var GulpConfig = require('az-gulp-env-lite').GulpConfig;

var projRoot  = path.resolve(__dirname, '..');
var config = {
  projRoot: projRoot,
  base: projRoot,
  submodules: {
    library: {
      prefix: 'library',
      entry: {
        dir: 'src/library',
        js: {
          glob: '**/*.{js,ts}',
        },
        ts: {
          tsconfig: 'tsconfig.json',
          glob: '**/*.ts',
        },
      },
      output: {
        default: {
          dir: 'dist',
        },
        //dev: {},
        //dist: {},
      },
    },
  },
};

module.exports = new GulpConfig(config);
