/*function getSelectedText() { 
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
    } else {
    	selectedText = "Hello";
    }

    return selectedText; 
}*/

chrome.runtime.onMessage.addListener(
  function(request) {
	document.getElementById("text").innerHTML = request;
	localStorage.setItem("Result", request);
  }
);

document.addEventListener('DOMContentLoaded', function() {
	document.getElementById("text").innerHTML = localStorage.getItem("Result");
	document.getElementById("input").value = localStorage.getItem("Complexity");
	document.querySelector('button').addEventListener('click', onclick, false)
		function onclick() {
			chrome.tabs.query({currentWindow: true, active: true},
				function (tabs) {
					document.getElementById("text").innerHTML = "Loading...";
					localStorage.setItem("Complexity", document.getElementById("input").value);
				    chrome.tabs.sendMessage(tabs[0].id, {"request": "word", "difficulty": document.getElementById("input").value});
				}
			)
		}
}, false)