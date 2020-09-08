window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
    document.getElementById("navbar").style.padding = "30px 10px";
    document.getElementById("comp").style.fontSize = "65px";
    document.getElementById("comp1").style.fontSize = "30px";
    document.getElementById("log").style.width="150px";
    document.getElementById("log").style.height="150px";
    document.getElementById('comp').style.paddingLeft="100px";
    document.getElementById('comp1').style.paddingLeft="30px";
  } else {
    document.getElementById("navbar").style.padding = "30px 10px";
    document.getElementById("comp").style.fontSize = "65px";
    document.getElementById("comp1").style.fontSize = "35px";
    document.getElementById('comp').style.paddingTop="10px";
    document.getElementById('comp').style.paddingLeft="200px";
    document.getElementById('comp1').style.paddingLeft="200px";
    document.getElementById("log").style.width="300px";
    document.getElementById("log").style.height="300px";
  }
}