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
      console.log('working', config, twitch.configuration.broadcaster)
      config = JSON.parse(config)
      console.log('working', config)
  }catch(e){
    console.log('not working')
    console.log(e)
  }
})

function changeConfig(){
  Twitch.ext.configuration.set('broadcaster','1','Hello World')
  twitch.rig.log('config ping')
  console.log('ggg',Twitch.ext.configuration.broadcaster)
  twitch.rig.log(Twitch.ext.configuration.global)
  twitch.rig.log(Twitch.ext.configuration.broadcaster)
  twitch.rig.log(Twitch.ext.configuration.developer)
  
}