#pd-gulp-base-task

##Install

	npm install platdesign/pd-gulp-base-task --save

##Use


	var baseTask = require('pd-gulp-base-task');
	
	module.exports = baseTask(function(){
		
		// Create a compile function
		this.compile(function(job, cb){
			
			this.gulp.src( job.config.src )
			.pipe( this.gulp.dest( job.config.dest ) )
			.on('end', cb);
			
		});
		
		
		this.appendTask('watch', {
			watch:true
		});
	});

##Methods

- `watchStarter(closure)` Create custom watch-handler. (e.g. for browserify/watchify or to add livereload)
- `init(closure)` Create custom job-initializer, (e.g. for browserify/watchify)
- `compile(closure)` Create a function which is called on compile.
- `appendTask(object)` Creates/Appends a gulp Task with the new Task and some default config. (e.g. for watch/uglify/etc)





