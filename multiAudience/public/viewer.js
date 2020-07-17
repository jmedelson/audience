let token = '';
let tuid = '';

const twitch = window.Twitch.ext;
var buttons=4;
var modePoll = 'true';
var tallyLimit = [100,100,100,100];
var inTimeOut = false;
var toSend = [0,0,0,0]
var resetCount = [0,0,0,0]
var voteArray = [0,0,0,0,0]
var votes = 0
// create the request options for our Twitch API calls
const requests = {
  set: createRequest('POST', 'message'),
  get: createRequest("POST","initial")
};

function createRequest (type, method) {
  return {
    type: type,
    url: 'https://j9y9eqotff.execute-api.us-east-2.amazonaws.com/dev/audience',
    success: updateBlock,
    error: logError,
    contentType: "application/json",
    data: ''
  };
}

function setAuth (token) {
  Object.keys(requests).forEach((req) => {
    twitch.rig.log('Setting auth headers');
    twitch.rig.log('Bearer' + token)
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
          twitch.rig.log("tally limit", tallyLimit)
      var x = document.getElementsByClassName("tally-button")
      count = 1
      for(item of x){
        if(config[count]){
          item.textContent = '0/' + config[count]
          tallyLimit[count-1] = config[count]
        }else{
          tallyLimit[count-1] = 100
        }
        count++
      }
      twitch.rig.log("tally limit", tallyLimit, config)
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
  setAuth(token);
  let message = {
    "signifier":"initial"
  }
  requests.get['data'] = JSON.stringify(message)
  $.ajax(requests.get);

});

function updateBlock (res) {
  // twitch.rig.log('Updating block');
  try{
    res = JSON.parse(res)
    // twitch.rig.log('Parsed',res.identifier);
    if(res.identifier == "initial"){
      // twitch.rig.log("res",res)
      let hold = document.getElementsByClassName("tally-button")
      count = 1;
      for(item of hold){
        resetCount[count-1] = Math.floor(res[count]/tallyLimit[count-1])
        item.textContent = (res[count]%tallyLimit[count-1])+ '/' + tallyLimit[count-1];
        count++
      }
      voteArray = [0,res["poll1"],res["poll2"],res["poll3"],res["poll4"]]
      votes = res["pollCount"]
      adjustPolls()
      if(res['display']== 'poll'){
        $('#graph-container').show()
        $('.tally-button').css("font-size", 0)
        modePoll = true
      }else if(res['display']== 'tally'){
        $('#graph-container').hide();
        $('.tally-button').css("font-size", '13px')
        modePoll = false
      }
    }
  }catch(err){
    twitch.rig.log('err',err)
  }
}

function logError(_, error, status) {
  twitch.rig.log('EBS request returned '+status+' ('+error+')');
}

function logSuccess(hex, status) {
  // twitch.rig.log('EBS request returned '+hex+' ('+status+')');
}
function adjustPolls(){
  let counter = 1
  while(counter < voteArray.length){
    let element = "#bar" + counter
    let element2 = '#barText' + counter
    let height = voteArray[counter]/votes*100
    if(isNaN(height)){height='0'}
    $(element2).html(Math.floor(height)+ '% (' +voteArray[counter]+')' )
    if(height < 4){height = 4}
    height = height + '%'
    $(element).stop().animate({height: height},800,function() {
      // Animation complete.
    })
    counter++
  }
}
function adjustButtons(){
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
}
function addButton(){
  // twitch.rig.log("ADD")
  let message = {
    "signifier":"reset",
    "viewChange":"four"
  }
  requests.set['data'] = JSON.stringify(message)
  $.ajax(requests.set);
  voteArray = [0,0,0,0,0]
  votes = 0
  if(buttons == 2){
    buttons = 4
    adjustButtons()
  }
  adjustPolls()
  
}
function minusButton(){
  // twitch.rig.log("Minus")
  let message = {
    "signifier":"reset",
    "viewChange":"two"
  }
  requests.set['data'] = JSON.stringify(message)
  $.ajax(requests.set);
  voteArray = [0,0,0,0,0]
  votes = 0
  if(buttons == 4){
    buttons = 2
    adjustButtons()
  }
  adjustPolls()
}
function tallyMode(){
  // twitch.rig.log("TALLY MODE");
  let message = {
    "signifier":"mode",
    "display": 'tally'
  }
  requests.set['data'] = JSON.stringify(message)
  $.ajax(requests.set);
  $('#graph-container').hide();
  $('.tally-button').css("font-size", '13px')
  modePoll = false
}
function pollMode(){
  // twitch.rig.log("POLL MODE")
  let message = {
    "signifier":"mode",
    "display": 'poll'
  }
  requests.set['data'] = JSON.stringify(message)
  $.ajax(requests.set);
  $('#graph-container').show()
  $('.tally-button').css("font-size", 0)
  modePoll = true
}
function resetMode(){
  let message = {
    "signifier":"reset",
    "viewChange":"none"
  }
  requests.set['data'] = JSON.stringify(message)
  $.ajax(requests.set);
}
// const map = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;
$(function () {
  // when we click the cycle button
  $('.tally-button').click(function(event){
    if(modePoll){
      
      votes++
      var target = event.target
      target = parseInt(target.id.slice(-1))
      voteArray[target] = voteArray[target] + 1
      // twitch.rig.log(voteArray)
      // var x = document.getElementsByClassName("bar")
      message = {
        "signifier":"vote",
        "voted": "poll"+target
      }
      requests.set['data'] = JSON.stringify(message)
      $.ajax(requests.set);
      adjustPolls()
    }
    if(!modePoll){
      var target = event.target
      // twitch.rig.log(target.id)
      var idnum = target.id.slice(-1)
      toSend[idnum-1]++
      element = '#' + target.id
      data = $(element).html()
      data = data.split('/')
      data[0] = parseInt(data[0])+1
      data[1] = parseInt(data[1])
      // twitch.rig.log(data)
      if(data[0] == data[1]){
        twitch.rig.log('WINNER!!!')
        target.style.pointerEvents = "none"
      }
      message = data[0]+'/'+data[1]
      $(element).html(message)
      if(!inTimeOut){
        inTimeOut = true
        setTimeout(function() {
          let message = {
            "tally1":toSend[0],
            "tally2":toSend[1],
            "tally3":toSend[2],
            "tally4":toSend[3],
            "signifier":"tally"
          }
          inTimeOut=false
          toSend=[0,0,0,0]
          requests.set['data'] = JSON.stringify(message)
          $.ajax(requests.set);
          twitch.rig.log('SENDING--', JSON.stringify(message))
        }, 5000);
      }
    }
  })
});

// EBS message handler
// listen for incoming broadcast message from our EBS
twitch.listen('broadcast', function (target, contentType, message) {
  // twitch.rig.log('Received broadcast',message);
  try{
    let data = JSON.parse(message).data
    // twitch.rig.log("identifier-", data["identifier"], data)
    if(data["identifier"] == "newTally"){
      let tallyArray = [data["tally1"] + toSend[0],data["tally2"]+ toSend[1],data["tally3"]+ toSend[2],data["tally4"]+ toSend[3]]
      var x = document.getElementsByClassName("tally-button")
      count = 0; 
      for(item of x){
        if(Math.floor(tallyArray[count]/tallyLimit[count])>resetCount[count]){
          resetCount[count] = Math.floor(tallyArray[count]/tallyLimit[count])
          let element = "#" + item.id
          $(element).addClass('winner')
          setTimeout(function() {
            twitch.rig.log("remove winner")
            $(element).removeClass("winner")
            $(element).css( 'pointer-events', 'auto' )
            
          }, 700);
        }
        item.textContent = (tallyArray[count]%tallyLimit[count]) + '/' + tallyLimit[count];
        // twitch.rig.log('count',count)
        count++
      }
    }else if(data["identifier"] == "newPoll"){
      voteArray=[0,data["poll1"],data["poll2"],data["poll3"],data["poll4"]]
      votes = data["count"]
      // twitch.rig.log("New Poll",voteArray,votes)
      adjustPolls()
    }else if(data["identifier"] == "newConfig"){
      tallyLimit[0] = data["config1"];
      tallyLimit[1] = data["config2"];
      tallyLimit[2] = data["config3"];
      tallyLimit[3] = data["config4"];
      var x = document.getElementsByClassName("tally-button")
      count = 0; 
      for(item of x){
        item.textContent = '0/' + tallyLimit[count];
        // twitch.rig.log('count',count)
        count++
      }
    }else if(data["identifier"] == "reset"){
      var x = document.getElementsByClassName("tally-button")
      let count = 0
      for(item of x){
        item.textContent = '0/' + tallyLimit[count];
        count++
      }
      toSend = [0,0,0,0]
      resetCount = [0,0,0,0]
      voteArray = [0,0,0,0,0]
      votes = 0
      adjustPolls()
      if(data["viewChange"] == 'two' && buttons == 4){
        buttons = 2
        adjustButtons()
      }else if(data["viewChange"] == 'four' && buttons == 2){
        buttons = 4
        adjustButtons()
      }
    }else if(data["identifier"] == "mode"){
      if(data["display"] == 'poll'){
        $('#graph-container').show()
        $('.tally-button').css("font-size", 0)
        modePoll = true
      }else if(data["display"] == 'tally'){
        $('#graph-container').hide();
        $('.tally-button').css("font-size", '13px')
        modePoll = false
      }
    }
  }catch(err){
    twitch.rig.log("Error parsing pubsub message", err.message, err)
  }
});