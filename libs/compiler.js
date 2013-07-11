/*
 * Compiler library for the test in the Fathomless lake app
 * This is under development, so don't use it! 
 *
 * FIXME: I need to check how should I store the errors @compiler
 *        and compare the stdout to the test @Test 
 */

var exec            = require ('child_process').exec,
    events          = require ('events'),
    event_emitter   = new events.EventEmitter(),
    Firebase        = require('firebase'),
    firebase_root   = new Firebase('https://fathomless-lake.firebaseio.com/'),
    fb_tester       = firebase_root.child('tester');

/*
 * exec_command runs a system command.
 *
 * @command: string, command to be executed 
 *
 * @callback: A function taking the output of the
 *            command, i.e.:
 *      function (error, stdout, stderr) {
 *          //somethings
 *      }
 */
function exec_command (command,test) {
    var cmd = exec (command);
    console.log ("[" + cmd.pid + "] Running child process " + command);
    cmd.stdout.on ('data', function (data) {
        event_emitter.emit ('stdout', data, test);
    });

    cmd.on ('exit', function (code, signal) {
        console.log("[" + cmd.pid + "] Program terminated with code " + code +
                    " And signal " + signal );
    });
};

function compiler (source) {
    this.error = null;
    this.source = source;
    this.compile = function () {
        var command = 'gcc -Wall -Werror -Wextra -g -o myex ' + this.source;
        exec_command (command, function (err, stdout, stderr) {
            if (err != null) {
                this.error = err;
                return;
            }

            if (this.error_on_stderr)
            {
                if (stderr != "") {
                    this.error = stderr;
                    return;
                }
            }
            this.error = null;
        });
    };

};

function Test () {
    this.tests = [];
    this.executable = undefined;
    this.passed_test = [];
    this.finished = false;
    this.__proto__ = events.EventEmitter.prototype;

    this.store = function () {
        if (this.finished) {
            fb_tester.set ({
                count: this.tests.length,
                executable: this.executable,
                test: this.tests,
                passed_test: this.passed_test
            });
        }
    };

    this.add = function (_n, _input, _output) {
        this.tests.push ({
            number: _n,
            input: _input,
            output: _output
        });
        this.passed_test.push(false);
    };
    this.clean_all = function () {
        this.tests = [];
        this.executable = undefined;
        this.passed_test = [];
    };

    this.clean_io = function () {
        this.passed_test = [];
    };
    
    var exec_command = function (command,test) {
        var cmd = exec (command);
        console.log ("[" + cmd.pid + "] Running child process " + command);
        cmd.stdout.on ('data', function (data) {
            this.emit ('stdout', data, test);
        });

        cmd.on ('exit', function (code, signal) {
            console.log("[" + cmd.pid + "] Program terminated with code " + code +
                        " And signal " + signal );
        });
    };

    this.run = function () {
        for (i=0; i < this.tests.length; i++) {
            console.log ("Running test n " + i);
            var command = 'echo "'+this.tests[i].input+'" | ./'+this.executable;
            exec_command (command, this.tests[i]);
        }

        var timeout = true;
        for (var i = 0; i < 10 ; i++) {
            setTimeout (this.store, 1000);
        };
        if (timeout)
            console.log ("[Timeout Error] Cannot store the data in firebase,"+
                         "The run function haven't finish");
    };

    this._on_stdout_cb = function (data, test) {
        console.log(this);
        this.passed_test[test.number] = (data == test.output);
        this.finished = (this.passed_test.length == this.tests.length);
    };
    this.on ('stdout', this._on_stdout_cb);
};

/* Exports */
exports.Compiler = compiler;
exports.Test = Test;

/* Main 
 * This is just a test to check if this actualy works. 
 * (Don't run in the app */

lucky = new compiler('lucky.c');
lucky.compile();
setTimeout (function () {

    /* Create a test */
    test = new Test();
    /* Set the executable */
    test.executable = "myex";
    /* Add a test */
    test.add (0,'2','3');
    /* Run the test */
    test.run();
    /* Wait a little */
    setTimeout ((function () {
        console.log ("passed test: " + test.passed_test);
    }), 5000);
},2000);
