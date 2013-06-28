/*
 * Compiler library for the test in the Fathomless lake app
 * This is under development, so don't use it! 
 *
 * FIXME: I need to check how should I store the errors @compiler
 *        and compare the stdout to the test @Test 
 */

var exec = require ('child_process').exec;

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
function exec_command (command, callback) {
    var cmd = exec (command, callback);
    console.log ("[" + cmd.pid + "] Running child process " + command);
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
    this.count = 0;
    this.tests = [];
    this.executable = undefined;
    this.passed_test = [];
    this.unpassed_test = [];
    this.add = function (_input, _output) {
        this.tests.push ({
            input: _input,
            output: _output
        });
        this.count += 1;
    };
    this.clean_all = function () {
        this.tests = [];
        this.count = 0;
        this.executable = undefined;
        this.passed_test = [];
        this.unpassed_test = [];
    };

    this.clean_io = function () {
        this.passed_test = [];
        this.unpassed_test = [];
    };

    this.run = function () {
        for (i=0; i < this.tests.length; i++) {
            console.log ("Running test n " + i);
            var command = 'echo "'+this.tests[i].input+'" | ./'+this.executable;
            exec_command (command, function (err, stdout, stderr) {
                if (err != null) {
                    // some error
                    console.log ("ERROR -> " + err);
                    return;
                }
                if (stdout == this.tests[i].output) {
                    this.passed_test.push (i);
                } else {
                    this.unpassed_test.push (i);
                }
            });
        }
    };
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
    test.add ('100000000','NO');
    /* Run the test */
    test.run();
    /* Wait a little */
    setTimeout ((function () {
        console.log ("passed test: " + test.passed_test);
        console.log ("unpassed test: " + test.unpassed_test);
    }), 5000);
},2000);
