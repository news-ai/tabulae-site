var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
// var AppCachePlugin = require('appcache-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = function(options) {
  var entry, jsLoaders, plugins, cssLoaders;

  // If production is true
  if (options.prod) {
    // Entry
    entry = [
      path.resolve(__dirname, 'js/config.shared.js'),
      path.resolve(__dirname, 'js/config.prod.js'),
      path.resolve(__dirname, 'js/app.js') // Start with js/app.js...
    ];
    cssLoaders = ExtractTextPlugin.extract('style-loader', ['css-loader', 'postcss-loader', 'sass-loader']);
    // Plugins
    plugins = [ // Plugins for Webpack
      new ExtractTextPlugin('react-toolbox.css', {allChunks: true}),
      new webpack.optimize.UglifyJsPlugin({ // Optimize the JavaScript...
        compress: {
          warnings: false // ...but do not show warnings in the console (there is a lot of them)
        }
      }),
      new HtmlWebpackPlugin({
        template: 'index.html', // Move the index.html file...
        minify: { // Minifying it while it is parsed
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true
        },
        inject: true,
        favicon: 'favicon.ico'
      }),
      new ExtractTextPlugin('css/main.css'),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
        }
      }),
      new webpack.optimize.AggressiveMergingPlugin()
    ];

  // If app is in development
  } else {
    // Entry
    entry = [
      'webpack-dev-server/client?http://localhost:3000', // Needed for hot reloading
      'webpack/hot/only-dev-server', // See above
      path.resolve(__dirname, 'js/config.shared.js'),
      path.resolve(__dirname, 'js/config.dev.js'),
      path.resolve(__dirname, 'js/app.js')
    ];
    cssLoaders = 'style-loader!css-loader!postcss-loader!sass-loader';
    // Only plugin is the hot module replacement plugin
    plugins = [
      new webpack.HotModuleReplacementPlugin(), // Make hot loading work
      new HtmlWebpackPlugin({
        template: 'index.html',
        inject: true,
        favicon: 'favicon.ico'
      })
    ];
  }

  // plugins.push(new AppCachePlugin({ // AppCache should be in both prod and dev env
  //   exclude: ['.htaccess'] // No need to cache that. See https://support.hostgator.com/articles/403-forbidden-or-no-permission-to-access
  // }));

  return {
    bail: true,
    devtool: 'source-map',
    entry: entry,
    output: { // Compile into js/build.js
      path: path.resolve(__dirname, 'build'),
      filename: 'js/bundle.js',
      publicPath: '/',
    },
    module: {
      loaders: [
        {
          test: /\.js$/, // Transform all .js files required somewhere within an entry point...
          loader: 'babel', // ...with the specified loaders...
          exclude: path.join(__dirname, '/node_modules/') // ...except for the node_modules folder.
        },
        {
          test: /\.css$/, // Transform all .css files required somewhere within an entry point...
          loader: cssLoaders // ...with PostCSS
        },
        {
          test: /\.jpe?g$|\.gif$|\.png$/i,
          loader: 'url-loader?limit=10000'
        },
        {
          include: /\.json$/, loaders: ['json-loader']
        },
      ]
    },
    resolve: {
      extensions: ['', '.json', '.jsx', '.js'],
      alias: {
        'node_modules': __dirname + '/node_modules',
        'img': __dirname + '/img',
        'constants': __dirname + '/js/constants',
        'actions': __dirname + '/js/actions',
        'components': __dirname + '/js/components',
        // temporary fix for missing require in `react-ga`
        // cf. https://github.com/react-ga/react-ga/issues/53
        'react/lib/Object.assign': 'object-assign'
      }
    },
    plugins: plugins,
    postcss: function() {
      return [
        require('postcss-import')({ // Import all the css files...
          glob: true,
          onImport: function(files) {
            files.forEach(this.addDependency); // ...and add dependecies from the main.css files to the other css files...
          }.bind(this) // ...so they get hot–reloaded when something changes...
        }),
        require('postcss-simple-vars')(), // ...then replace the variables...
        require('postcss-focus')(), // ...add a :focus to ever :hover...
        require('autoprefixer')({ // ...and add vendor prefixes...
          browsers: ['last 2 versions', 'IE > 8'] // ...supporting the last 2 major browser versions and IE 8 and up...
        }),
        require('postcss-reporter')({ // This plugin makes sure we get warnings in the console
          clearMessages: true
        })
      ];
    },
    target: 'web', // Make web variables accessible to webpack, e.g. window
    stats: false, // Don't show stats in the console
    progress: true,
  };
};
