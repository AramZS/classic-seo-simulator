// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
const googleTrends = require('google-trends-api');


// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/json-trends', function(request, response) {
  googleTrends.interestOverTime({keyword: ['Women\'s march', 'Jeff Flake']})
  .then(function(results){
    console.log('These results are awesome', results);
    var jsonResults = JSON.parse(results);
    var lastResult = jsonResults.default.timelineData.length - 1;
    response.json(jsonResults.default.timelineData[lastResult]);
  })
  .catch(function(err){
    console.error('Oh no there was an error', err);
  });
});

app.get('/json-geo-trends', function(request, response) {
  googleTrends.interestByRegion({keyword: 'Jeff Flake', startTime: new Date('2018-01-01'), resolution: 'COUNTRY'})
    .then(function(results){
    console.log('These results are awesome', results);
    var jsonResults = JSON.parse(results);
    var finalResults = jsonResults.default.geoMapData.find(function(data){
      return data.geoCode === 'US';
    });
    //var lastResult = jsonResults.default.timelineData.length - 1;
    response.json(finalResults);
  })
  .catch(function(err){
    console.error('Oh no there was an error', err);
  });
});

app.get('/json-geo-trend', function(request, response) {
  if (request.query && Object.keys(request.query).length !== 0 && request.query.term.length !== 0 ) {
    var term = request.query.term.replace(/-/g, ' ');
	} else {
    response.json({ results: {} });
  }
  googleTrends.interestByRegion({keyword: term, startTime: new Date('2018-01-01'), resolution: 'COUNTRY'})
    .then(function(results){
    console.log('These results are awesome', results);
    var jsonResults = JSON.parse(results);
    var finalResults = jsonResults.default.geoMapData.find(function(data){
      return data.geoCode === 'US';
    });
    //var lastResult = jsonResults.default.timelineData.length - 1;
    response.json({query: term, results: finalResults});
  })
  .catch(function(err){
    console.error('Oh no there was an error', err);
  });
});

function chunkArray(myArray, chunk_size){
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];
    
    for (index = 0; index < arrayLength; index += chunk_size) {
        var myChunk = myArray.slice(index, index+chunk_size);
        // Do something if you want with the group
        tempArray.push(myChunk);
    }

    return tempArray;
}

function trendsQuery(trendQuery) {
  return new Promise(function(resolve, reject) {

    googleTrends.interestOverTime({keyword: trendQuery, startTime: new Date('2018-01-01')}).then(function(results){
      console.log('These results are awesome', results);
      var jsonResults = JSON.parse(results);
      //response.json({ query: terms, 'results': jsonResults });
      var lastResult = jsonResults.default.timelineData.length - 1;
      var trendResults = [];
      var mostRecentValue = jsonResults.default.timelineData[lastResult];
      trendQuery.forEach(function(trendName, index){
        var trendResult = {};
        var trendValue = mostRecentValue.formattedValue[index];
        if ( trendValue === '<1' ){
          trendValue = '1';
        }
        trendResult[trendName] = trendValue;
        trendResults.push(trendResult);
      });
      resolve(trendResults);
    })
    .catch(function(err){
      console.error('Oh no there was an error', err);
      resolve([]);
    });
  });
}

app.get('/json-trend', function(request, response) {
  if (request.query && Object.keys(request.query).length !== 0 && request.query.terms.length !== 0 ) {
    var terms = request.query.terms.replace(/-/g, ' ');
		var trendQuery = terms.split('|');
	} else {
    response.json({ results: {} });
  }
  console.log('q:', trendQuery);
  var chunkOfArrays = chunkArray(trendQuery, 3);
  var resultSet = [];
  chunkOfArrays.forEach(function(termSet){
    console.log(termSet);
    resultSet.push(trendsQuery(termSet));
  });
  console.log('chunks', chunkOfArrays);
  Promise.all(resultSet).then(function(results){
    console.log('result set', results);
    var resultsTotal = [];
    results.forEach(function(aResult){
      resultsTotal = resultsTotal.concat(aResult);
    });
    console.log('Result total', resultsTotal);
    response.json({ query: trendQuery, calculated: resultsTotal});
  });
  
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
