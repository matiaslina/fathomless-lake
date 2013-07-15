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

var Test = function () {
    this.tests = [];
    this.executable = undefined;
    this.passed_test = [];
    this.finished = false;
    this.timeout = 2;
    
    this.add = function (n, input, output) {
        var self = this;
        self.tests.push ({
            number: n,
            input: input,
            output: output
        });
        self.passed_test.push(false);
    }
}
Test.__proto__ = events.EventEmitter.prototype;

Test.prototype.clean_all = function () {
    var self = this;
    // clean the executable.
    self._exec("rm " + self.executable);
    self.tests = [];
    self.executable = undefined;
    self.passed_test = [];
    self.finished = false;
}

Test.prototype.clean_io = function () {
    var self = this;
    self.passed_test = [];
}

Test.prototype._exec = function (command,test) {
    var out = "";
    var self = this;
    var cmd = exec (command);
    console.log ("[" + cmd.pid + "] Running child process " + command);
    console.log ("Trying to get the output");
    cmd.stdout.on ('data', function (data) {
        console.log ("Output -> " + data);
        out = data;
    });
    setTimeout (function () {
        if (out != "") {
            self.set_passed_tests (out, test);
        } else {
            console.log ("[Timeout Error] Cannot get the output");
        }   
    }, self.timeout * 1000);

    cmd.on ('exit', function (code, signal) {
        // nothing
    });
}

Test.prototype.set_passed_tests = function (data, test) {
    console.log (test);
    this.passed_test[test.number] = (data == test.output);
    this.finished = (this.passed_test.length == this.tests.length);
}

Test.prototype.run = function () {
    for (i=0; i < this.tests.length; i++) {
        console.log ("Running test n " + i);
        var command = 'echo "'+this.tests[i].input+'" | ./'+this.executable;
        this._exec(command, this.tests[i]);
    }

    var timeout = true;
    for (var i = 0; i < 10 ; i++) {
        setTimeout (this.store, 3000);
    };
    if (timeout)
        console.log ("[Timeout Error] Cannot store the data in firebase,"+
                     "The run function haven't finish");
}

Test.prototype.store = function () {
    if (this.finished) {
        fb_tester.set ({
            count: this.tests.length,
            executable: this.executable,
            test: this.tests,
            passed_test: this.passed_test
        });
    }
};



/* Exports */
exports.Compiler = compiler;
exports.Test = Test.__proto__;

/* Main 
 * This is just a test to check if this actualy works. 
 * (Don't run in the app */
console.log (Test);
lucky = new compiler('lucky.c');
lucky.compile();
setTimeout (function () {

    /* Create a test */
    test = new Test();
    /* Set the executable */
    test.executable = "myex";
    console.log (test);
    /* Add a test */
    test.add (0,'2','3');
    /* Run the test */
    test.run();
    /* Wait a little */
    setTimeout ((function () {
        console.log ("passed test: " + test.passed_test);
        console.log ("Cleaning all");
        test.clean_all ();
    }), 5000);
},2000);
