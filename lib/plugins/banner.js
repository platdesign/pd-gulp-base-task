'use strict';

var extend = require('extend');
var fs = require('fs');
var path = require('path');



module.exports = function banner(opts) {
	opts = opts || {};

	if(opts.banner) {
		var header = require('gulp-header');

		var template = '';
		var locals = {};

		if( typeof opts.banner === 'string' ) {
			template = opts.banner;
		} else if(typeof opts.banner === 'object' && opts.banner !== null) {
			if(opts.banner.file) {
				template = fs.readFileSync(opts.banner.file, 'utf-8');
			} else {
				template = opts.banner.template;
			}
			locals = opts.banner.locals;
		}

		var defaultLocals = {
			date: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
			pkg: {}
		};

		var pkgFile = path.join( process.cwd(), 'package.json' );
		if( fs.existsSync(pkgFile) ) {
			defaultLocals.pkg = JSON.parse( fs.readFileSync(pkgFile, 'utf-8') );
		}

		locals = extend(true, defaultLocals, locals);


		return header(template, extend(true, defaultLocals, locals));

	}
};






