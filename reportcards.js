/*jslint nomen: true */
/*jslint node:true */

var AdmZip = require("adm-zip");
var zip = new AdmZip();
var _ = require('lodash');
var Hapi = require('hapi');

    // add file directly

var server = new Hapi.Server({ connections: { routes: { cors: { origin: ['http://backupreport.eu.mt.mtnet'] } } } });

server.connection({
    port: 8000
});

zip.addLocalFile("reportcards\\reportcard-eu.html");
zip.addLocalFile("reportcards\\reportcard-ap.html");
zip.addLocalFile("reportcards\\reportcard-am.html");

var test = "<html><body>Cool <b>Stuff</b></body></html>";

zip.addFile("test", test);
zip = new AdmZip(zip.toBuffer());

//test

function getCompressFile(file, callback) {
    "use strict";
    var zipEntries = zip.getEntries();
    _.each(zipEntries, function (entry, index) {
        if (entry.entryName === file) {
            callback(zip.readAsText(zipEntries[index]));
        }
    });
}

function setCompressFile(file, content) {
    "use strict";
    zip.updateFile(file, content);
    zip = new AdmZip(zip.toBuffer());
}

server.route({
    method: 'GET',
    path: '/get/dpa/eu-reportcard/{data}',
    handler: function (request, reply) {
        "use strict";
        //saveData2Redis(redisKeys.dpaDDspace, JSON.stringify(ddSpace));
        var data = request.params.data,
            test2 = "<html><body>Cool <b>Stuff!!!!!</b></body></html>";
        if (data === "AM") {
            getCompressFile('reportcard-am.html', function (ret) {
                console.log("sending webpage-AM");
                reply(ret);
            });
        }
        if (data === "EU") {
            getCompressFile('reportcard-eu.html', function (ret) {
                console.log("sending webpage-EU");
                reply(ret);
            });
        }
        if (data === "AP") {
            getCompressFile('reportcard-ap.html', function (ret) {
                console.log("sending webpage-AP");
                reply(ret);
            });
        }
        if (data === "TEST") {
            getCompressFile('test', function (ret) {
                console.log("sending webpage-test");
                reply(ret);
            });
        }
        if (data === "up") {

            setCompressFile("test", test2);
            reply("Data updated");

        }
    }
});


server.route({
    method: 'GET',
    path: '/set/dpa/eu-reportcard/{data}',
    handler: function (request, reply) {
        "use strict";
        //saveData2Redis(redisKeys.dpaDDspace, JSON.stringify(ddSpace));
        var data = request.params.data;
        console.log(request.params);
        console.log(data);
        setCompressFile("test", data);
        reply("Data updated");
    }
});



server.start(function () {
    "use strict";
    console.log('info', "Server running at", server.info.uri);
});

