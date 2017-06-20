const webpack = require('webpack');

module.exports = {
	plugins: [
    require('postcss-easy-import'),
    require('postcss-simple-vars')(), // ...then replace the variables...
    require('postcss-focus')(), // ...add a :focus to ever :hover...
    require('autoprefixer')({ // ...and add vendor prefixes...
      browsers: ['last 2 versions', 'IE > 8'] // ...supporting the last 2 major browser versions and IE 8 and up...
    }),
    require('postcss-reporter')({ // This plugin makes sure we get warnings in the console
      clearMessages: true
    })
	]
};
