// demo.js
//
// A demo for node-tyrant
// Version 0.1.3
// Requires node 0.1.18 or later
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

var tyrant = require("./tyrant");
var sys = require('sys');

function simpleStoreAndRetreive() {
  sys.puts('Writing 10 records..');
  for (var i=0; i<10; i++) {
    tyrant.put('val_'+i, 'Record number '+i);
  }
  sys.puts('Reading 10 records :');
  for (var i=0; i<10; i++) {
      tyrant.get('val_'+i, function(err, value) {
      sys.puts('Result '+i+' : '+value);
    });
  }
}


function appendToRecord() {
  tyrant.put('key1', 'First Value');
  tyrant.putcat('key1', '+Second Value');
  tyrant.get('key1', function(err, value) {
    if (err) {sys.puts('Error : '+error);}
    sys.puts('Result : '+value);
  });
}

function addToCounter() {
    tyrant.addint('counter', 1, function(err, value) {sys.puts('Result '+value);});
}


function tableStoreAndRetreive() {
  sys.puts('Writing 10 table records..');
  for (var i=0; i<10; i++) {
    tyrant.put('k_'+i, 'name', 'Mr. Number '+i);
  }
  sys.puts('Reading 10 table records :');
  for (var i=0; i<10; i++) {
      tyrant.get('k_'+i, function(err, values) {
      var r=tyrant.dict(values);
      sys.puts('Result '+i+' : name = '+r.name); // is always 10....
    });
  }
}

function tableStoreAndRetreiveWithClosure() {
  sys.puts('Writing 10 table records..');
  for (var i=0; i<10; i++) {
    tyrant.put('k_'+i, 'name', 'Mr. Number '+i);
  }
  sys.puts('Reading 10 table records :');
  for (var i=0; i<10; i++) {
    (function(i) {
	tyrant.get('k_'+i, function(err, values) {
	 var r=tyrant.dict(values);
	 sys.puts('Result '+i+' : name = '+r.name); // is now the expected value for i
       });
    })(i); // Stick i into the anonymous function, so it has it at this value, not the overall variable in the enlarged scope
  }
}


function tableSearchExample() {
  // Store some names and create an index
  tyrant.put('k1', 'name', 'Joe Blogs');
  tyrant.put('k2', 'name', 'Joe Smith');
  tyrant.put('k3', 'name', 'Bill Smith');
  tyrant.setindex('name', tyrant.ITLEXICAL, function(err, value) {
    if (err) {sys.puts('Error : '+error);}
    sys.puts('Result : '+value);
  });

  // Do a test get
  tyrant.get('k1', function(err, value) {value=tyrant.dict(value); sys.puts('Name = '+value.name);});

  // Do some searches
  tyrant.search(tyrant.starts('name', 'Joe'), tyrant.sort('name', 'asc'), function(err, value) {
    if (err) {sys.puts('Error : '+error);}
    sys.puts('Result : '+value);
  });
  tyrant.search(tyrant.starts('name', 'Joe'), tyrant.sort('name', 'desc'), function(err, value) {
    if (err) {sys.puts('Error : '+error);}
    sys.puts('Result : '+value);
  });
  tyrant.search(tyrant.ends('name', 'Smith'), function(err, value) {
    if (err) {sys.puts('Error : '+error);}
    sys.puts('Result : '+value);
  });
  tyrant.search(tyrant.starts('name', 'Joe'),tyrant.ends('name', 'Smith'), function(err, value) {
    if (err) {sys.puts('Error : '+error);}
    sys.puts('Result : '+value);
  });

  // Add a few more records
  for (var i=0; i<20; i++) {
    tyrant.put('ki'+i, 'name', 'Mr '+i);
  }


  // Do some more searches
  tyrant.search(tyrant.starts('name', 'Mr'), tyrant.sort('name', 'asc'), function(err, value) {
    if (err) {sys.puts('Error : '+error);}
    sys.puts('Result : '+value);
  });
  tyrant.search(tyrant.starts('name', 'Mr'), tyrant.sort('name', 'desc'), function(err, value) {
    if (err) {sys.puts('Error : '+error);}
    sys.puts('Result : '+value);
  });

  // Test limit and offset
  tyrant.search(tyrant.starts('name', 'Mr'), tyrant.sort('name', 'asc'), tyrant.limit(5, 5), function(err, value) {
    if (err) {sys.puts('Error : '+error);}
    sys.puts('Result : '+value);
  });


  tyrant.getlist(['ki0', 'ki1'], function(err, v) {
		   for (var i=0; i<v.length; i++) {
		     sys.puts('Name : '+v[i]);
		   }
		 });

  // Test some helper functions
  tyrant.get('ki0', function(err, value) {value=tyrant.dict(value); sys.puts('Name = '+value.name);});
}

function generalDemo() {
  simpleStoreAndRetreive();
  appendToRecord();
  addToCounter();
}


function tableDemo(){
  tableStoreAndRetreive();
  tableStoreAndRetreiveWithClosure();
  tableSearchExample();
}

function runDemo() {

    tyrant.status(function(err, s) {
    sys.puts('Tokyo Tyrant Server Status');
    sys.puts('--------------------------');
    sys.puts(s);
    sys.puts('\n');
    if (s.indexOf('type\ttable')>=0) {
      tableDemo();
    } else {
      generalDemo();
    }
    tyrant.quit();
  });
}

tyrant.connect();
tyrant.addListener('connect', function() {
	runDemo();
});
