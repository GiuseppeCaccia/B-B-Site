var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    var pre = this.previousElementSibling; 
    if (content.style.display === "block") {
      content.style.display = "none";
      pre.style.display="block";
    } else {
      content.style.display = "block";
      pre.style.display="none";
    }
  });
}

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    var pre = this.previousElementSibling; 
    if (content.style.maxHeight){
      content.style.maxHeight = null;
      pre.style.maxHeight =pre.scrollHeight + "px"; ;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
      pre.style.maxHeight = null;
    }
  });
}