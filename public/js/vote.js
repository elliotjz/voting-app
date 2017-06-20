
function newOptionCheck(selection) {
    if (selection.value == "I have a better option...") {
        document.getElementById("newOptionText").style.display = "block";
    } else {
        document.getElementById("newOptionText").style.display = "none";
    }
}

document.getElementById("vote-form").submit(function(data) {
	window.location.href = "/vote-submit";
});