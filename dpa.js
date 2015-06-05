/*jslint nomen: true */
/*jslint node:true */


var watchr = require('watchr');
var fs = require('fs');

var tricoExport = 't:';
var csvfile = 'D:\\scripts\\Servers\\Trico.csv';

var apiServer = "http://ch00sdpaapp:8000";

function readFile(file, cvsFile) {
    "use strict";
    console.log(file);

    var XLS = require('xlsjs'),
        workbook = XLS.readFile(file),
        sheet_name_list = workbook.SheetNames,
        Sheet1A1 = workbook.Sheets[sheet_name_list[0]]['A1'].v,
        csv = XLS.utils.sheet_to_csv(workbook.Sheets[sheet_name_list[0]]),
        LineByLineReader = require('line-by-line'),
        lineCnt = 0,
        newoutput = "",
        lr = new LineByLineReader(cvsFile);


    fs.writeFile(cvsFile, csv, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("The file was saved!");

        }
    });


    lr.on('error', function (err) {

    // 'err' contains error object
    });

    lr.on('line', function (line) {
        lineCnt += 1;
        if (lineCnt > 3) {
            newoutput = newoutput + line + "\n";
        }
    // 'line' contains the current line without the trailing newline character.
    });

    lr.on('end', function () {
        fs.unlinkSync(csvfile);
        fs.writeFile(cvsFile, newoutput, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("The file was saved!");
            }


        });

    // All lines are read, file is closed now.
    });

}


// watch directory

//var tricoExport = 'out/';
//var csvfile = 'converted/trico.csv';


watchr.watch({
    paths: [tricoExport],
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
            } else {
                console.log("watching the path " + watcherInstance.path + " completed");
            }
        },
        change: function (changeType, filePath, fileCurrentStat, filePreviousStat) {
            "use strict";
            console.log('a change event occured:', arguments[0], arguments[1]);
            if (arguments[0] === 'create') {
                readFile(arguments[1], csvfile);
                console.log("File got created:" + arguments[1]);
            }
             if (arguments[0] === 'update') {
                readFile(arguments[1], csvfile);
                console.log("File updated:" + arguments[1]);
            }
        }
    },
    next: function (err, watchers) {
        "use strict";
        if (err) {
            return console.log("watching everything failed with error", err);
        } else {
            console.log('watching everything completed');
        }
    }
});


var parse = require('csv-parse');
var _ = require('lodash');
var fs = require('fs');

var watchr = require('watchr');
//var request = require('request');

var winston = require('winston');

require('winston-redis').Redis;

var options = {
    name: "redis",
    host: "ch00sm33",
    container: "winston.logging.ch00sdpaapp.readcsv",
    length: 1000
};

winston.add(winston.transports.Redis, options);

winston.info('info','Program Started');

var columnList = {};
var DDSpaceColumns = ['hostname', 'utilization', 'capacity', 'usedCapacity', 'freeCapacity', 'lastDaysChange', 'dedupeRatio'];

columnList.ddSpace = DDSpaceColumns;

var cList = 'ddSpace';
//var file = 'dpa_monitor/DDSpace.csv';

fs = require('fs');

function readCSV(file, callback) {

    fs.readFile(file, 'utf8', function (err, data) {
        "use strict";
        if (err) {
            return console.log(err);
        }
        parse(data, {columns: columnList[cList]}, function (err, output) {
            //console.log(output);

            var ddSpaceList = _.drop(output);
        //console.log(ddSpaceList);
            callback(ddSpaceList);
        });
    });
}

function upload(val,callback) {
    var request = require('request');
        request(apiServer + '/set/ddspace/' + JSON.stringify(val), function (error, response, body) {
  if (!error && response.statusCode === 200) {
    console.log(body) // Show the HTML for the Google homepage.
  } else {
    //console.log(error);
  }
            callback(response.statusCode);
})
    //console.log(val);
}






var dpa_monitor = 'dpa_monitor/';

watchr.watch({
    paths: [dpa_monitor],
    listeners: {
        log: function(logLevel){
            //console.log('a log message occured:', arguments);
        },
        error: function(err){
            console.log('an error occured:', err);
        },
        watching: function(err,watcherInstance,isWatching){
            if (err) {
                //console.log("watching the path " + watcherInstance.path + " failed with error", err);
            } else {
                //console.log("watching the path " + watcherInstance.path + " completed");
            }
        },
        change: function(changeType,filePath,fileCurrentStat,filePreviousStat){
            console.log('a change event occured:',arguments[0], arguments[1]);
            var f = arguments[1];
            var fileToDelete = f.split("\\").join("/");
            if (arguments[0] === 'create') {
                //readXml(arguments[1]);
                //readFile(arguments[1]);

                console.log(fileToDelete);
                readCSV(fileToDelete, function (val) {
                    "use strict";
                    upload(val, function (n) {
                        console.log(n);
                        //mystring
                        //var f =  arguments[1];
                        //var fileToDelete = f.split("\\").join("/");
                        fs.unlinkSync(fileToDelete);
                    });
                });
                console.log("File got created:" + arguments[1]);
                winston.info('File got created',arguments[1]);
                //fs.unlink(arguments[1]);
            }
             if (arguments[0] === 'update') {
                //readXml(arguments[1]);
                //readFile(arguments[1]);
                 console.log(fileToDelete);
                readCSV(fileToDelete, function (val) {
                    "use strict";
                    upload(val, function (n) {
                        console.log(n);
                        //var f =  arguments[1];
                        // var fileToDelete = f.split("\\").join("/");
                        fs.unlinkSync(fileToDelete);
                    });
                });
                 winston.info('File updated',arguments[1]);
                console.log("File updated:" + arguments[1]);
                //fs.unlink(arguments[1]);
            }
        }
    },
    next: function(err,watchers){
        if (err) {
            return console.log("watching everything failed with error", err);
        } else {
            //console.log('watching everything completed', watchers);
        }


    }
});


//   ******** start of configuration ************

var watchr = require('watchr');
var path = require('path');

var configurationValues = {
    'apiServer': "http://ch00sdpaapp:8000",
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
            } else {
                console.log("watching the path " + watcherInstance.path + " completed");
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


