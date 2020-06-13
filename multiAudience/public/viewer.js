let token = '';
let tuid = '';

const twitch = window.Twitch.ext;

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
const map = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;
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
    twitch.rig.log(number)
    height = number + '%'
    $("#bulb-text").html(height)
  })
});
