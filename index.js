const  { Client, Intents }  =  require('discord.js')
const  youtubeSearch =  require("youtube-search");
const { joinVoiceChannel , createAudioPlayer , createAudioResource } = require("@discordjs/voice")
const ytdl  = require("ytdl-core")

const TOKEN = ""
const CHANNEL_ID = ""
const YT_KEY = ""

const client = new Client({
    shards:'auto',
    intents: [
        Intents.FLAGS.GUILDS,      
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,   
    ]
})

client.login(TOKEN)
client.on("ready", () => { console.log('bot is ready connected') })

let botIsPlaying = false

client.on('messageCreate',async msg => {    


    if(msg.author.bot) return
    const res = await searchYoutubeMusic(msg.content)
    msg.reply(`play music : ${res.link}`)
    botIsPlaying  = true
    joinChannel(CHANNEL_ID , res.link)
    console.log('end: messageCreate')
})


function joinChannel(channelId, link){
        client.channels.fetch(channelId).then( (c) => {
            console.log('🟢 valid channelId :' , c.id)

            const voiceConn = joinVoiceChannel({
                channelId : c.id,
                guildId : c.guild.id,
                adapterCreator : c.guild.voiceAdapterCreator
                
            })

            const mediaSource = createAudioResource(ytdl(link) , { inlineVolume : true })
            mediaSource.volume.setVolume(1)

            const player = createAudioPlayer()
            voiceConn.subscribe(player)

            player.play(mediaSource)

            player.on('idle', () => {
                try{

                    player.stop()
                    voiceConn.destroy()   
                    botIsPlaying = false;

                }catch(error){
                    console.log('🔴 error :', error)
                }
            })
        })
}


function searchYoutubeMusic(text){
    return new Promise((resolve , reject) => {
        youtubeSearch(text, {
            maxResults: 10,
            key:YT_KEY
        }, (err, results) => {
          if(err) {
             const errMsg = `Not found : ${text}`
             reject(errMsg)
          }
          resolve(results[0])
        });
    })

}






