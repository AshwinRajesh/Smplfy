// content.js
chrome.runtime.onMessage.addListener(
  async function(request) {
	var sentence = getSelectedText();
	sentence = sentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()""''?+<>]/g,"").trim().split(" ");
	var newSentence = [];
	for (var i = 0; i < sentence.length; i++) {
		var d = await getFrequency(sentence[i]);
		var f = d[0];
		var p = d[1];
		var diff = 100 - parseInt(request["difficulty"]);
		if ((f < diff) && (sentence[i][0] !== sentence[i][0].toUpperCase())) {
			var word = await getWords(sentence[i], f, p, diff);
			newSentence.push(word);
		} else {
			newSentence.push(sentence[i]);
		}
	}
	newSentence = newSentence.join(" ");
	chrome.runtime.sendMessage(newSentence);
  }
);

async function getWords(word, freq, pos, diff) {
	var words = [];
	await fetch("https://api.datamuse.com/words?ml=" + word).then(r => r.text()).then(result => {
    	// Result now contains the response text, do what you want...
    	var obj = JSON.parse(result);
    	var iter = Math.min(obj.length, 10);
    	for (var i = 0; i < iter; i++) {
    		var w = obj[i].word;
    		var s = obj[i].score;
    		words.push({"word": w, "score": s, "frequency": 0})
    	}
	})
	var index = -1;
	var max = -1;
	for (var i = 0; i < words.length; i++) {
		var d = await getFrequency(words[i]["word"]);
		var f = d[0];
		var p = d[1];
		var s = words[i]["score"];
		words[i]["frequency"] = f;
		if (p.some((val) => pos.indexOf(val) > -1) && (s > 30000)) {
			if (f > diff) {
				return words[i]["word"];
			}
			if (f > max) {
				max = f;
				index = i;
			}
		}
	}
	return ((((freq > max) || (words.length == 0)) || (index == -1 && max == -1)) ? word : words[index]["word"]);
}

async function getFrequency(word) {
	var frequency = 0;
	var pos = "";
	await fetch("https://api.datamuse.com/words?sp=" + word + "&md=fp&max=1").then(r => r.text()).then(result => {
    	// Result now contains the response text, do what you want...
    	var obj = JSON.parse(result);
    	//console.log(obj);
    	if (obj.length > 0) {
	    	frequency = parseInt(obj[0]["tags"][obj[0]["tags"].length - 1].substring(2));
	    	pos = obj[0]["tags"];
	    	pos.pop();
	    }
   
	})
	return [frequency, pos];
}

function getSelectedText() { 
    var selectedText = ''; 
    // window.getSelection 
    if (window.getSelection) { 
        selectedText = window.getSelection().toString(); 
    } 
    // document.getSelection 
    else if (document.getSelection) { 
        selectedText = document.getSelection().toString(); 
    } 
    // document.selection 
    else if (document.selection) { 
        selectedText =  
        document.selection.createRange().text; 
    } else return;

    return selectedText; 
}