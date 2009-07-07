// demo.js
//
// A demo for node-tyrant
// Version 0.1
// Rhys Jones, Acknack Ltd 2009
//
// Copyright 2009, Acknack Ltd. All rights reserved.
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.

var tyrant = require("tyrant.js");

function simpleStoreAndRetreive() {
  puts('Writing 10 records..');
  for (var i=0; i<10; i++) {
    tyrant.put('val_'+i, 'Record number '+i);
  }
  puts('Reading 10 records :');
  for (var i=0; i<10; i++) {
    tyrant.get('val_'+i, function(value, error) {
      puts('Result '+i+' : '+value);
    });
  }
}


function tableStoreAndRetreive() {
  puts('Writing 10 table records..');
  for (var i=0; i<10; i++) {
    tyrant.put('k_'+i, 'name', 'Mr. Number '+i);
  }
  puts('Reading 10 table records :');
  for (var i=0; i<10; i++) {
    tyrant.get('k_'+i, function(values) {
      var r=tyrant.dict(values);
      puts('Result '+i+' : name = '+r.name); // is always 10....
    });
  }
}

function tableStoreAndRetreiveWithClosure() {
  puts('Writing 10 table records..');
  for (var i=0; i<10; i++) {
    tyrant.put('k_'+i, 'name', 'Mr. Number '+i);
  }
  puts('Reading 10 table records :');
  for (var i=0; i<10; i++) {
    (function(i) {
       tyrant.get('k_'+i, function(values) {
	 var r=tyrant.dict(values);
	 puts('Result '+i+' : name = '+r.name); // is now the expected value for i
       });
    })(i); // Stick i into the anonymous function, so it has it at this value, not the overall variable in the enlarged scope
  }
}

function generalDemo() {
  simpleStoreAndRetreive();

}


function tableDemo(){
  tableStoreAndRetreive();
  tableStoreAndRetreiveWithClosure();

}

function runDemo() {
  tyrant.connect();

  tyrant.status(function(s) {
    puts('Tokyo Tyrant Server Status');
    puts('--------------------------');
    puts(s);
    puts('\n');
    if (s.indexOf('type\ttable')>=0) {
      tableDemo();
    } else {
      generalDemo();
    }
    tyrant.quit();
  });
}

function onLoad() {
  runDemo();
}