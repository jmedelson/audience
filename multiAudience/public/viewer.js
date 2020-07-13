let token = '';
let tuid = '';

const twitch = window.Twitch.ext;
var buttons=4;
// create the request options for our Twitch API calls
const requests = {
};

function createRequest (type, method) {
  return {
    type: type,
    url: location.protocol + '//localhost:8081/color/' + method,
    success: updateBlock,
    error: logError
  };
}

function setAuth (token) {
  Object.keys(requests).forEach((req) => {
    twitch.rig.log('Setting auth headers');
    requests[req].headers = { 'Authorization': 'Bearer ' + token };
  });
}

twitch.onContext(function (context) {
  twitch.rig.log(context);
});

twitch.onAuthorized(function (auth) {
  // save our credentials
  token = auth.token;
  tuid = auth.userId;
});

function updateBlock (hex) {
  twitch.rig.log('Updating block color');
}

function logError(_, error, status) {
  twitch.rig.log('EBS request returned '+status+' ('+error+')');
}

function logSuccess(hex, status) {
  twitch.rig.log('EBS request returned '+hex+' ('+status+')');
}
function addButton(){
  // twitch.rig.log("ADD")
  voteArray = [0,0,0,0,0]
  if(buttons == 2){
    votes = 0
    buttons = 4
    var element = '<button id="vote3" class="vote-button">C</button>'
    $("#vote-button-div").append(element)
    var element = '<button id="vote4" class="vote-button">D</button>'
    $("#vote-button-div").append(element)
    var element = '<div class="bar" id="bar'+ 3 +'"><p id="barText'+ 3 +'" class="barText">0%</p></div>'
    $("#bar-container").append(element)
    var element = '<div class="bar" id="bar'+ 4 +'"><p id="barText'+ 4 +'" class="barText">0%</p></div>'
    $("#bar-container").append(element)
    var x = document.getElementsByClassName("bar")
    var width = (100/buttons)*0.75
    for(var item of x){
      item.style.width = width+'%'
    }
    width = buttons * 3
    document.getElementById('vote-button-container').style.width = width+'%' 
  }
  counter = 1
  while(counter < voteArray.length){
    var element = "#bar" + counter
    var element2 = '#barText' + counter
    height = '4%'
    $(element).stop().animate({height: height},'easeInOutCubic',function() {
      // Animation complete.
    })
    $(element2).html('0% (0)')
    counter++
  }
  
}
function minusButton(){
  // twitch.rig.log("Minus")
  voteArray = [0,0,0]
  if(buttons == 4){
    votes = 0
    buttons = 2
    $('#vote3').remove();
    $('#bar3').remove();
    $('#vote4').remove();
    $('#bar4').remove();
    var width = buttons * 3
    document.getElementById('vote-button-container').style.width = width+'%'
    var x = document.getElementsByClassName("bar")
    var width = (100/buttons)*0.75
    for(var item of x){
      item.style.width = width+'%'
    } 
  }
  counter = 1
  while(counter < voteArray.length){
    var element = "#bar" + counter
    var element2 = '#barText' + counter
    height = '4%'
    $(element).stop().animate({height: height},'easeInOutCubic',function() {
      // Animation complete.
    })
    $(element2).html('0% (0)')
    counter++
  }
}
const map = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;
var voteArray = [0,0,0,0,0]
var votes = 0
$(function () {
  // when we click the cycle button
  $("button").click(function(){
    var min = Math.ceil(0);
    var max = Math.floor(101);
    var number = Math.floor(Math.random() * (max - min)) + min;
    var height = map(number,0,100,10,200)
    var bottom = map(number,0,100,-80,140)
    bottom = bottom +'%'
    $("#mercury").animate({height:height, bottom:bottom})
    // twitch.rig.log(number)
    height = number + '%'
    $("#bulb-text").html(height)
  });
  $(".sound-button").click(function(event){
    var target = event.target
    twitch.rig.log(target.id)
  })
  // $(".vote-button").click(function(event)
  $("#vote-button-div").on('click', '.vote-button', function(event){
    votes++
    var target = event.target
    // twitch.rig.log(target.id)
    target = parseInt(target.id.slice(-1))
    voteArray[target] = voteArray[target] + 1
    twitch.rig.log(voteArray)
    var x = document.getElementsByClassName("bar")
    // twitch.rig.log('l',x.length)
    var counter = 1
    while(counter < voteArray.length){
      var element = "#bar" + counter
      var element2 = '#barText' + counter
      var height = voteArray[counter]/votes*100
      $(element2).html(Math.floor(height)+ '% (' +voteArray[counter]+')' )
      if(height < 1){height = 1}
      height = height + '%'
      $(element).stop().animate({height: height},'easeInOutCubic',function() {
        // Animation complete.
      })
      counter++
    }
  });
});