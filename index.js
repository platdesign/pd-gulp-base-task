'use strict';

var async = require('async');
var transform = require('vinyl-transform');
var path = require('path');
var fs = require('fs');
var header = require('gulp-header');

module.exports = function pdGulpBaseTask(options) {


	function Task(input) {
		var that = this;

		this.helper = helper;

		this.jobsConfigs = [];
		this.options = {};

		Object.keys(input).forEach(function(key) {

			if(key === 'options') {
				that.options = input[key];
			} else {
				that.jobsConfigs.push(input[key]);
			}

		});
	}
	Task.create = function(options) {
		return new Task(options);
	};

	Task.prototype.gulpHandler = function() {
		var that = this;

		var jobs = [];

		this.jobsConfigs.forEach(function(config) {
			jobs.push(function(callback) {
				that.worker(config, callback);
			});
		});

		return function(callback) {
			async.series(jobs, callback);
		};
	};
	Task.prototype.worker = function(fn) {
		this.worker = fn;
	};


	return Task.create(options);

};





var helper = {

	useOnStream: function(fn, stream) {
		return stream.pipe( transform(function(filename) {
			return fn.apply(stream, [stream]);
		}) );
	},

	banner: function(template) {

		return header(template, {
			pkg: JSON.parse( fs.readFileSync('package.json', 'utf8') ),
			date: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
		});
	}

};
