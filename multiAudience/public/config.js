let token, userId;

const twitch = window.Twitch.ext;

twitch.onContext((context) => {
  twitch.rig.log(context);
});

twitch.onAuthorized((auth) => {
  token = auth.token;
  userId = auth.userId;
});

twitch.configuration.onChanged(function(){
  console.log('On Changed')
  let config = twitch.configuration.broadcaster ? twitch.configuration.broadcaster.content: []
  try{
      config = JSON.parse(config)
      var x = document.getElementsByClassName("data")
      count = 1
      for(item of x){
        if(config[count]){
          item.value = config[count]
        }
        count++
      }
      console.log('working', config)
  }catch(e){
    console.log('not working')
    console.log(e)
  }
})
function success(){
  twitch.rig.log("EBS SUCCESS")
}
function failure(){
  twitch.rig.log("EBS FAILURE")
}
function changeConfig(){
  var config = {}
  var x = document.getElementsByClassName("data")
  count = 1
  twitch.rig.log(x.length)
  for(item of x){
    var data = item.value
    config[count] = data
    count++
  }
  twitch.rig.log(JSON.stringify(config))
  console.log(config)
  config1 = JSON.stringify(config)
  twitch.configuration.set(segment="broadcaster", version=1,content=config1)
  config['signifier'] = 'config-update'
  requests = {
    type: "POST",
    url: 'https://j9y9eqotff.execute-api.us-east-2.amazonaws.com/dev/audience',
    success: success,
    error: failure,
    contentType: "application/json",
    data: JSON.stringify(config),
    headers: { 'Authorization': 'Bearer ' + token }
  }
  $.ajax(requests);
  twitch.rig.log("AJAX SENT")
}
$(function () {
  $('#setConfig').click(function(event){
    changeConfig()
  })
}