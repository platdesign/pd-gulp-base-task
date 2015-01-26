'use strict';

require('colors');
var extend = require('extend');
var gutil = require('gulp-util');
var async = require('async');
var watch = require('gulp-watch');

var baseTask = function(pluginName, configFn) {

	var Klasse = function() {

		this.watchStarter(function(job, compile) {
			watch(job.config.watch===true ? job.config.src : job.config.watch, function() {
				compile(job);
			});
		});

	};

	Klasse.prototype.init = function(fn) {
		this._jobInitializator = fn;
	};

	Klasse.prototype.compile = function(worker) {
		this._worker = worker;
	};

	Klasse.prototype.appendTask = function(taskName, options, registerHandler) {
		this._register = this._register || [];

		this._register.push({
			name: taskName,
			fn: registerHandler || function(handler, options) {
				this.appendGulpTask(taskName, handler(options));
			},
			options: options
		});
	};

	Klasse.prototype.watchStarter = function(fn) {
		this._watchStarter = fn;
	};

	Klasse.prototype.appendGulpTask = function(taskName, deps, fn) {

		if(!fn && deps) {
			fn = deps;
			deps = null;
		}

		var gulp = this.gulp;

		var task = gulp.tasks[taskName] = gulp.tasks[taskName] || {
			fn: function(cb) { cb(); },
			dep:[],
			name: taskName
		};

		if(deps) {
			task.dep = task.dep.concat(deps);
		}

		if(fn) {
			var oldFn = task.fn;
			task.fn = function(cb) {
				oldFn(function(err) {
					if(err) { return cb(err); }

					fn(cb);
				});
			};
		}

	};




	Klasse.prototype.options2jobs = function(hash) {
		var that = this;

		var options = hash.options || {};
		var jobs = [];

		Object.keys(hash).forEach(function(key) {
			if(key !== 'options') {

				var job = {
					name: pluginName+':'+key,
					config: hash[key],
					options: options
				};


				var initializeJob = function() {
					job.initialized = true;
					that.log('Initialized subtask '+job.name.cyan, '✔'.green);
				};


				jobs.push(function(asyncCallback) {
					var noCallback = false;
					var compileCallback = function(err) {

						if(err) {
							that.logError('Error in '.red+job.name.cyan, '✕'.red);
							console.log('Message\n', err.message, '\n');
						} else {
							that.log('Compiled '+job.name.cyan, '✔'.green);
						}

						if(!noCallback) {
							asyncCallback();
						}

						noCallback = true;
					};

					function compile() {
						var args = [].slice.call(arguments).concat(compileCallback);

						if(!job.initialized) {
							initializeJob();
						}

						that.log('Compiling '+job.name.cyan, '...');
						that._worker.apply(that, args);
					}

					function jobInitializator(job, compile) {
						compile(job);

						if(job.config.watch) {
							that._watchStarter(job, compile);
						}
					}
					if(that._jobInitializator) {
						jobInitializator = that._jobInitializator;
					}

					jobInitializator(job, compile, initializeJob);

				});


			}
		});

		return jobs;

	};


	Klasse.prototype.runWorkerOnOptions = function(options, cb) {

		async.series( this.options2jobs(options), cb);

	};


	var loggingPrefix = '    ⌊────➤ ';

	Klasse.prototype.log = function() {
		console.log.apply(console, [loggingPrefix.cyan].concat([].slice.call(arguments)));
	};
	Klasse.prototype.logError = function() {
		console.log.apply(console, [loggingPrefix.red].concat([].slice.call(arguments)));
	};



	Klasse.prototype.plugin = function(name, opts) {
		opts = opts || {};

		if(baseTask.plugin[name]) {
			return baseTask.plugin[name].apply(this, [opts]) || gutil.noop();
		}

	};


	Klasse.prototype.publicApi = function() {
		var that = this;
		var api = function(options) {
			return function(cb) {
				try {
					that.runWorkerOnOptions(options, cb);
				}catch(e) {
					cb(e);
				}

			};
		};


		/**
		 * Register default tasks
		 * @param  {[type]} options [description]
		 *    {
		 *    	options: {
		 *    		banner: 'template'
		 *    	},
		 *    	default: {
		 *
		 *    	},
		 *    	watch: {
		 *
		 *    	},
		 *    	build: {
		 *    	}
		 *    }
		 *
		 *
		 * @return {[type]}         [description]
		 */
		api.register = function(jobOptions, taskDefaultOptions) {

			taskDefaultOptions = taskDefaultOptions || {};

			that._register.forEach(function(item) {
				var taskOptions = {};

				Object.keys(jobOptions).forEach(function(key) {
					if(key === 'options') {
						taskOptions.options = jobOptions.options;
					} else {
						taskOptions[key] = extend(true, {}, jobOptions[key], item.options, taskDefaultOptions[item.name]);
					}
				});

				item.fn.apply(that, [api, taskOptions]);

			});

		};

		return api;
	};

	return function(gulp) {
		var instance = new Klasse();

		instance.gulp = gulp;

		configFn.apply(instance, [instance]);

		return instance.publicApi();
	};

};


baseTask.plugin = {};

baseTask.plugin.banner = require('./lib/plugins/banner.js');


module.exports = baseTask;
