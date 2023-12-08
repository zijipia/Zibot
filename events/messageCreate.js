const { EmbedBuilder } = require("discord.js");
const { rank } = require("./Zibot/ZilvlSys");
const config = require("../config");
const playmusic = async(lang, message, client, content) => {
    if (!message.member.voice.channelId) return message.reply({ content: `${lang?.NOvoice}`, ephemeral: true }).catch(e => { })
    const voiceCME = message?.guild.members.cache.get(client.user.id);
    if (voiceCME.voice.channelId && (voiceCME.voice.channelId !== message.member.voice.channelId))
        return message.reply({ content: `${lang?.NOvoiceChannel}`, ephemeral: true }).catch(e => { })
    return require("./ziplayer/ziSearch")(message, content)
}
module.exports = async (client, message) => {
    if ( message.author.bot ) return;
    let content = message?.content?.toLowerCase()
    if (content.includes("@here") || content.includes("@everyone")) return;
    let lang = await rank({ user: message?.author });
    /////////// gi ??????????????????????????//////////////////////////
    if(message?.channel?.id == "1182675589539307520"){
        try{
        let Gichannel =  client.channels.cache.get("1007723706379935747");
        // Regular expression to match the expiration time pattern
        const expirationPattern = /(\d+)h/;
        const CODEregex = /\(([^)]+)\)/g;
        // Extract the expiration time from the input
        const match = message?.content.match(expirationPattern);
        const expirationHours = match ? parseInt(match[1], 10) : 12; // Default to 12 hours if not specified

        // Calculate the expiration time in seconds
        const expirationTime = Math.floor((Date.now() + expirationHours * 60 * 60 * 1000) / 1000);

        // Replace substrings and add expiration time
        const modifiedMessage = message?.content.replace(
            /(:Primogem:)|(:Heros_Wit:)|(:Mora:)|(:Mystic_Enhancement_Ore:)/g,
            (match, primogem, herosWit, mora, mysticEnhancementOre) => {
              if (primogem) {
                return "<:Primogem:1182685530245312583>";
              } else if (herosWit) {
                return "<:Heros_Wit:1182685523840618517>";
              } else if (mora) {
                return "<:Mora:1182685520602611803>";
              } else if (mysticEnhancementOre) {
                return "<:Mystic_Enhancement_Ore:1182685526407528528>";
              }
              return match; // No replacement needed for other cases
            }
          );
        ///////////
        const info = new EmbedBuilder()
        .setColor("Random")
        .setTitle(`**New promote code found:**`)
        .setURL(`https://genshin.hoyoverse.com/vi/gift`)
        .setDescription(`${modifiedMessage.replace(`${expirationHours}h`,"").replace(CODEregex, (match) => `** [${match.replace("(","").replace(")","")}](https://genshin.hoyoverse.com/vi/gift?code=${match.replace("(","").replace(")","")}) **`) } \n Code sẽ hết hạn sau <t:${expirationTime}:R>`)
        .setTimestamp()
        .setFooter({ text: `By Ziji`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setImage("https://cdn.discordapp.com/attachments/1064851388221358153/1122054818425479248/okk.png");
        Gichannel?.send({ embeds: [info] });
    }catch(e){
        message.reply(`ERR: ${e}`);
    }
    }
//////////////////////////////////////////////////////////////////////////////////
    if ( message?.reference && content.includes(`<@${client.user.id}>`) ){
    return message.channel?.messages.fetch({ message: message?.reference?.messageId, cache: false, force: true }).then( mess => {
       if(!mess?.content) return;
        return playmusic(lang, message, client, mess.content )
    })}
    
    if (content.includes(`<@${client.user.id}>`))
    if (content.match(new RegExp(`^<@!?${client.user.id}>( |)$`))) {
        message.reply({ embeds:[
            new EmbedBuilder()
            .setColor(lang?.COLOR || client.color)
            .setTitle("Yo... Ziji desu :3")
            .setDescription(`${lang?.MENstion}\n${config?.Zmodule} ✅`)
            .setURL("https://discord.com/api/oauth2/authorize?client_id=1005716197259612193&permissions=1067357395521&scope=bot%20applications.commands")
            .setTimestamp()
            .setFooter({ text: `${lang?.RequestBY} ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setImage('https://cdn.discordapp.com/attachments/1064851388221358153/1122054818425479248/okk.png')
        ]});
    }else{
        if(content.includes("search")){
            if(config.messCreate.GoogleSearch)
            return require("./../commands/search").run(lang, message, content.replace(`<@${client.user.id}>`,"").replace("search",""))
        }else{
            if(config.messCreate.PlayMusic && message?.guild)
            return playmusic(lang, message, client, message?.content.replace(`<@${client.user.id}>`,"") )
        }
    }
}
