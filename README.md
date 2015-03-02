#pd-gulp-task-generator-generator

Generates a pd-gulp-task-generator.

## Install

	npm install --save pd-gulp-task-generator-generator

## Use

```javascript
var createGenerator = require('pd-gulp-task-generator-generator');
	
module.exports = createGenerator('copy', function(){
		
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
```



## Methods

- `watchStarter(closure)` Create custom watch-handler. (e.g. for browserify/watchify or to add livereload)
- `init(closure)` Create custom job-initializer, (e.g. for browserify/watchify)
- `compile(closure)` Create a function which is called on compile.
- `appendTask(object)` Creates/Appends a gulp Task with the new Task and some default config. (e.g. for watch/uglify/etc)



