const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } = require("discord.js");
const db = require("./../../mongoDB");
const client = require("../..");


module.exports = async ( interaction, queue, lang ) => {
    await interaction?.deferReply();
    const tracl = [];
    queue?.tracks?.map(async ( track , i) =>{
        tracl.push({
            title: track.title,
            author: track.author,
            url: track.url,
            duration: track.duration
        })
    })
    let ziQueue =  await db?.Ziqueue?.findOne({ guildID: interaction?.guild?.id, channelID: interaction?.channel?.id }).catch(e=>{ });
    let page = ziQueue?.page || 0
    let a = tracl.length / 20
    let b = `${ a + 1 }`
    let toplam = b.charAt(0)
    page = ( page + 1 ) > toplam ? 1 : ( page + 1 );
    let currentIndex = ( page - 1 ) * 20;
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
        .setEmoji("❌")
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("QueueCancel"),
        new ButtonBuilder()
        .setLabel("Clear")
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("ZiplayerQueueClear")
    )
    const embed = async(start) =>{
        let nowww = page === 1 ? 1 : page * 20 - 20;
        const current = tracl.slice( start , start + 20 )
        if(!current || ! current?.length > 0 ) return interaction?.editReply({ content: ` `, ephemeral: true }).catch(e=>{ });
        return new EmbedBuilder()
            .setTitle(`${lang?.Queue}: ${interaction?.guild?.name}`)
            // .setThumbnail(interaction?.user?.displayAvatarURL({ dynamic:true, size:1024 }))
            .setDescription(`${current.map(data =>
                 `\n${ nowww++ } | [${data.title.substr(0,25)+"..."}](${data.url}) | ${data.author.substr(0,15)+"..."}`)}
            `)
            .setFooter({ text: `${page}/${toplam}`})
            .setTimestamp()
    }
    //send messenger::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    if(!ziQueue){
        await interaction.editReply({ embeds:[ await embed( currentIndex )], components:[row] }).then(async Message =>{
            await db.Ziqueue.updateOne({ guildID: interaction?.guild?.id, channelID: interaction?.channel?.id },{
                $set:{
                    messageID: Message.id,
                    page: page,
                    toplam: toplam
                }
            },{ upsert: true }).catch(e => { })
        }).catch(e => { })
    }else{
        await interaction.deleteReply();
        await db.Ziqueue.updateOne({ guildID: interaction?.guild?.id, channelID: interaction?.channel?.id },{
            $set:{
                page: page,
                toplam: toplam
            }
        },{ upsert: true }).catch(e => { })
        await interaction.channel?.messages.fetch({ message: ziQueue?.messageID, cache: false, force: true })
            .then(async msg => msg.edit({ embeds:[ await embed( currentIndex )] })).catch(e => { })
    }
    return;
}