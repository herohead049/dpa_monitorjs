/*jslint nomen: true */
/*jslint node:true */


//   ******** start of configuration ************

var watchr = require('watchr');
var path = require('path');

var configurationValues = {
    'apiServer': "http://us01w-davidc:8000",
    'folder': 'configuration/'
};


function countLines (file, callback) {
    "use strict";
    var i;
    var count = 0;
    require('fs').createReadStream(file)
        .on('data', function(chunk) {
            for (i = 0; i < chunk.length; ++i)
                if (chunk[i] == 10) count++;
        })
        .on('end', function() {
            //console.log(count);
        callback(count);
        });

    //return cnt;
}

function uploadCnt(val, callback) {
    "use strict";
    console.log(val,JSON.stringify(val));
    var request = require('request');
    request(configurationValues.apiServer + '/set/configuration/' + val, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log(body);
        }
        callback(response.statusCode);
    });
}




watchr.watch({
    paths: [configurationValues.folder],
    listeners: {
        log: function (logLevel) {
            "use strict";
            //console.log('a log message occured:', arguments);
        },
        error: function (err) {
            "use strict";
            console.log('an error occured:', err);
        },
        watching: function (err, watcherInstance, isWatching) {
            "use strict";
            if (err) {
                console.log("watching the path " + watcherInstance.path + " failed with error", err);
            }
        },
        change: function (changeType, filePath, fileCurrentStat, filePreviousStat) {
            "use strict";
            console.log('a change event occured:', arguments[0], arguments[1]);
            var f = arguments[1];
            if (arguments[0] === 'create') {
                countLines(f, function (v) {
                    var fn = path.basename(f,".csv");
                    uploadCnt('{"key":"' + fn + '-cnt","value":' + v + '}', function (val) {
                        console.log(val);
                    });
                    console.log(v,path.basename(f,'.csv'));
                });
            }
            if (arguments[0] === 'update') {
                 countLines(f, function (v) {
                    var fn = path.basename(f,".csv");
                    uploadCnt('{"key":"' + fn + '-cnt","value":' + v + '}', function (val) {
                        console.log(val);
                    });
                    console.log(v,path.basename(f,'.csv'));
                });
            }
        }
    },
    next: function (err, watchers) {
        "use strict";
        if (err) {
            return console.log("watching everything failed with error", err);
        }

    }
});

//   ******** end of configuration ************

