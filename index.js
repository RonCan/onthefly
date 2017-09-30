/*
Special thanks to https://violentatom.com/2015/07/08/node-js-chokidar-wait-for-file-copy-to-complete-before-modifying/ for the code to detect end of file transfer
* */
// Setup video source folder observer for notifications of new files
var chokidar = require('chokidar');

var watcher = chokidar.watch(config.videoRawFolder, {
    persistent: true,
    followSymlinks: false,
    usePolling: true,
    depth: undefined,
    interval: 100,
    ignorePermissionErrors: false
});

watcher
    .on('ready', function() { logger.info('Initial scan complete. Ready for changes.'); })
    .on('unlink', function(path) { logger.info('File: ' + path + ', has been REMOVED'); })
    .on('error', function(err) {
        logger.error(component + 'Chokidar file watcher failed. ERR: ' + err.message);
    })
    .on('add', function(path) {
        logger.info('File', path, 'has been ADDED');

        fs.stat(path, function (err, stat) {

            if (err){
                logger.error(component + 'Error watching file for copy completion. ERR: ' + err.message);
                logger.error(component + 'Error file not processed. PATH: ' + path);
            } else {
                logger.info(component + 'File copy started...');
                setTimeout(checkFileCopyComplete, fileCopyDelaySeconds*1000, path, stat);
            }
        });
    });

// Makes sure that the file added to the directory, but may not have been completely copied yet by the
// Operating System, finishes being copied before it attempts to do anything with the file.
function checkFileCopyComplete(path, prev) {
    fs.stat(path, function (err, stat) {

        if (err) {
            throw err;
        }
        if (stat.mtime.getTime() === prev.mtime.getTime()) {
            logger.info(component + 'File copy complete => beginning processing');
            //-------------------------------------
            // CALL A FUNCTION TO PROCESS FILE HERE
            //-------------------------------------
        }
        else {
            setTimeout(checkFileCopyComplete, fileCopyDelaySeconds*1000, path, stat);
        }
    });
}