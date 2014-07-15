var util = require('util');
var assert = require('basic-assert');
var stream = require('./stream');

var console = (function(origConsole) {
	return {
		lines: [],
		
		log: function() {
			var args = Array.prototype.slice.apply(arguments);
			var argsCopy = args.slice();
			argsCopy.unshift('[console]');
			origConsole.log.apply(origConsole, argsCopy);
			this.lines.push(args.map(function(arg) {
				if (typeof arg === 'string') {
					return arg;
				}
				return util.format(arg);
			}).join(' '));
		}
	}
})(global.console);

function assertPrinted(str) {
	if (str !== null) {
		var actual = console.lines.shift();
		assert.is(actual, str);
	} else {
		assert.eq(console.lines, []);
	}
}

var s = stream();
console.log(s.value); // -> undefined
assertPrinted('undefined');

console.log(stream(123).value); // -> 123
assertPrinted('123');

s.forEach(function(value) {
	console.log(value);
});

s.set(1); // -> 1
assertPrinted('1');
console.log(s.value); // -> 1
assertPrinted('1');

s.set(1); // no effect
assertPrinted(null);

// because if you simply pass console.log around, it'll 
// have the wrong `this`
var log = console.log.bind(console);

var s2 = s.map(function(x) { return x * 2; });
s2.forEach(function(value) {
	console.log('s2 is', value);
});

s.set(5); // -> 5; s2 is 10
assertPrinted('5');
assertPrinted('s2 is 10');

