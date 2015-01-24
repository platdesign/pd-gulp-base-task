'use strict';

var async = require('async');


module.exports = function pdGulpBaseTask(options) {


	function Task(input) {
		var that = this;

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
