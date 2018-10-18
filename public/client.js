// client-side js
// run by the browser each time your view template is loaded

console.log('hello world :o');

window.score = 0;

// define variables that reference elements on our page
const termList = document.getElementById('termlist');
const scoreArea = document.getElementById('score');
const tweetStatus = document.getElementById('tweetStatus');
const seoForm = document.forms[0];
const seoTitle = seoForm.elements['seo-title'];
const seoDescrip = seoForm.elements['seo-description'];
const seoCode = document.getElementById('inside-code');

const updateScore = function(){
  var innerHTMLTwitterButton = ' <a target="_blank" href="https://twitter.com/intent/tweet?button_hashtag=brokenadtech&ref_src=twsrc%5Etfw&url=https://seo-simulator.glitch.me/&text=I\'m a web master in the Classic SEO Simulator Game! My score is: '+Number(window.score).toLocaleString()+'! " class="twitter-hashtag-button" data-size="large" data-text="I\'m a web master in the Classic SEO Simulator Game! My score is: '+Number(window.score).toLocaleString()+'! " data-url="https://seo-simulator.glitch.me/" data-show-count="false">Tweet #brokenadtech</a>';
  tweetStatus.innerHTML = innerHTMLTwitterButton;
  scoreArea.innerText = window.score;
}

// a helper function that creates a list item for a given dream
const appendNewTerm = function(term) {
  const newListItem = document.createElement('li');
  var scoreToConsider = parseInt(term[Object.keys(term)[0]]);
  if (scoreToConsider > 50){
    scoreToConsider = 100-scoreToConsider;
  }
  window.score += scoreToConsider;
  updateScore();
  newListItem.innerHTML = Object.keys(term)[0] + ' Trend Score: ' + term[Object.keys(term)[0]];
  termList.appendChild(newListItem);
}

const buildSEOCode = function(title, descrip) {
  return '<title>'+title+'</title>\n<meta name="description" content="'+descrip+'" />';
}

const getKeyWordValues = function(terms) {
  var xhr = new XMLHttpRequest(),
      method = "GET",
      url = location.href+"json-trend/?terms="+terms;
  console.log();
  xhr.open(method, url, true);
  xhr.onreadystatechange = function () {
    if(xhr.readyState === 4 && xhr.status === 200) {
      var jsonObj = JSON.parse(xhr.responseText);
      console.log(jsonObj.calculated);
      jsonObj.calculated.forEach(function(term){
        appendNewTerm(term);
      });
    }
  };
  xhr.send();
}

// listen for the form to be submitted and add a new dream when it is
seoForm.onsubmit = function(event) {
  // stop our form submission from refreshing the page
  event.preventDefault();
  termList.innerHTML = '';
  var codeToShow = buildSEOCode(seoTitle.value.replace(/#/g, ''), seoDescrip.value.replace(/#/g, ''));
  var titleTermSet = seoTitle.value.match(/\B\#([a-zA-Z0-9_-][a-zA-Z0-9_-]+\b)/g);
  var descripTermSet = seoDescrip.value.match(/\B\#([a-zA-Z0-9_-][a-zA-Z0-9_-]+\b)/g);
  var termString = '';
  if (titleTermSet && titleTermSet.length > 0){
    termString += titleTermSet.join('|');
    termString += '|';
  }
  if (descripTermSet && descripTermSet.length > 0){
    termString += descripTermSet.join('|');
  } else {
    termString = termString.substring(0, termString.length - 1);
  }
  var termStringFinal = termString.replace(/#/g, '');
  window.score = 0;
  getKeyWordValues(termStringFinal);
  console.log('terms', termStringFinal);
  seoCode.innerText = codeToShow;
  
  // appendNewTerm(termsInput.value);

  seoTitle.focus();
};
