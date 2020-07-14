let token = '';
let tuid = '';

const twitch = window.Twitch.ext;
var buttons=4;
var modePoll = 'true'
// create the request options for our Twitch API calls
const requests = {
  set: createRequest('POST', 'message'),
};

function createRequest (type, method) {
  return {
    type: type,
    url: 'https://j9y9eqotff.execute-api.us-east-2.amazonaws.com/dev/audience',
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

twitch.configuration.onChanged(function(){
  console.log('On Changed')
  let config = twitch.configuration.broadcaster ? twitch.configuration.broadcaster.content: []
  try{
      console.log('working', config, twitch.configuration.broadcaster)
      config = JSON.parse(config)
      var x = document.getElementsByClassName("tally-button")
      count = 1
      for(item of x){
        if(config[count]){
          item.textContent = '0/' + config[count]
        }
        count++
      }
      console.log('working', config)
  }catch(e){
    console.log('not working')
    console.log(e)
  }
})

twitch.onAuthorized(function (auth) {
  // save our credentials
  token = auth.token;
  tuid = auth.userId;
});

function updateBlock () {
  twitch.rig.log('Updating block');
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
    $('#vote3').toggle();
    $('#bar3').toggle();
    $('#vote4').toggle();
    $('#bar4').toggle();
    $('#tally3').toggle()
    $('#tally4').toggle()
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
  voteArray = [0,0,0,0,0]
  if(buttons == 4){
    votes = 0
    buttons = 2
    $('#vote3').toggle();
    $('#bar3').toggle();
    $('#vote4').toggle();
    $('#bar4').toggle();
    $('#tally3').toggle()
    $('#tally4').toggle()
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
function tallyMode(){
  twitch.rig.log("TALLY MODE");
  $('#graph-container').hide();
  $('.tally-button').css("font-size", '13px')
  modePoll = false
}
function pollMode(){
  twitch.rig.log("POLL MODE")
  $('#graph-container').show()
  $('.tally-button').css("font-size", 0)
  modePoll = true
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
  $('.tally-button').click(function(event){
    if(modePoll){
      votes++
      var target = event.target
      target = parseInt(target.id.slice(-1))
      voteArray[target] = voteArray[target] + 1
      twitch.rig.log(voteArray)
      var x = document.getElementsByClassName("bar")
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
    }
    if(!modePoll){
      var target = event.target
      twitch.rig.log(target.id)
      element = '#' + target.id
      data = $(element).html()
      data = data.split('/')
      data[0] = parseInt(data[0])+1
      data[1] = parseInt(data[1])
      twitch.rig.log(data)
      if(data[0] == data[1]){
        twitch.rig.log('WINNER!!!')
        data[0] = 0
        $(element).addClass('winner')
        setTimeout(function() {
          $(element).removeClass("winner");
      }, 1000);
      }
      message = data[0]+'/'+data[1]
      $(element).html(message)
      requests.set['data'] = {"tally1":5,"tally2":15,'tally3':3,'tally4':0}
      $.ajax(requests.set);
    }
  })
});