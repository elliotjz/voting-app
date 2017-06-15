
function newOptionCheck(selection) {
    if (selection.value == "I have a better option...") {
        document.getElementById("newOptionText").style.display = "block";
    } else {
        document.getElementById("newOptionText").style.display = "none";
    }
}