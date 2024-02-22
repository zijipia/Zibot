const { ModalBuilder, ActionRowBuilder, TextInputStyle, TextInputBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("./../../mongoDB");
const { rank } = require("../Zibot/ZilvlSys");
const { validURL, Zicrop } = require("../Zibot/ZiFunc");
const config = require("../../config");

module.exports = async (client, interaction) => {
  try {
    if(config.messCreate.PlayMusic)
    if (validURL(interaction.customId)) {
      await require("./../ziplayer/ziSearch")(interaction, interaction.customId);
      return interaction?.message.delete();
    }
    let lang;
    //Zi module------------------------------------------------//
    if (interaction?.customId.includes("Ziplayer")){
      if(!config.messCreate.PlayMusic) return;
      lang = await rank({ user: interaction?.user });
      return require("./../ziplayer/ZiplayerFuns")(interaction, lang)
    } 
    if (interaction?.customId.includes("Zsearchref")){
      if (!config.messCreate.GoogleSearch) return;
      lang = await rank({ user: interaction?.user });
      interaction?.deferUpdate()
       return require("./../../commands/search").run(lang, interaction.message, Zicrop(interaction?.customId), true)}
    //ZiVc---------------------------------------------------------//
    if (interaction?.customId.includes("ZiVC")){
      if(!config.EnableJOINTOCREATE) return;
      lang = await rank({ user: interaction?.user });
      return require("./../Zibot/Zivc")(interaction, lang)
    } 
    //GI------------------------------------------------//
    if (interaction?.customId.includes("GI")){
      if(!config.messCreate.GI) return;
      lang = await rank({ user: interaction?.user });
      return require("./../Zibot/enkapross")(interaction, lang)
    } 
    if ( !config.interactionCreate.MessageComponentInside ) return;
    //rank sys------------------------------------------------//
    lang = await rank({ user: interaction?.user });
    //cooldows-------------------------------------------------//
    const expirationTime = lang?.cooldowns + 3 * 1000;
    if (Date.now() < expirationTime) {
      const expiredTimestamp = Math.round(expirationTime / 1000);
      return interaction.reply({ content: `${lang?.cooldownsMESS.replace(`{expiredTimestamp}`, expiredTimestamp).replace(`{interaction.commandName}`, `'.'`)}`, ephemeral: true });
    }

    switch (interaction.customId) {
      case "cancel":
        return interaction?.message.delete();
      case "cancelXcancel":
        return interaction?.message.edit({components: [ ]})
      case "QueueCancel":
        await db.Ziqueue.deleteOne({ guildID: interaction?.guild?.id, channelID: interaction?.channel?.id }).catch(e => { });
        return interaction?.message.delete();
      case "DelTrack": {
        const modal = new ModalBuilder()
          .setCustomId('DelTrackmodal')
          .setTitle(`Delete Track ${interaction?.guild?.name} `)
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('number')
                .setLabel(`Track Number`)
                .setPlaceholder(`${lang?.Deltrack}`)
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            )
          )
        return interaction?.showModal(modal);
      }
      case "Guills": {
        const rowC = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("❌")
            .setStyle(ButtonStyle.Secondary)
        )
        let Index = 1;
        const embed = new EmbedBuilder()
          .setColor(lang.COLOR || client.color)
          .setTitle("Zi bot Guild:")
          .setTimestamp()
          .setDescription(`${client.guilds.cache.map((guild) => `${Index++} |\`${guild.name}\``).join('\n')}`)
          .setFooter({ text: `${lang?.RequestBY} ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
          .setImage(lang?.banner);
        return interaction.reply({ embeds: [embed], components: [rowC] }).catch(e => { })
      }
      case "MesPiNJG":{
        return interaction.reply("https://cdn.discordapp.com/attachments/1162041451895599154/1162047498572009493/image.png")
      }
      case "Statistics":{
        const rowC = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("❌")
            .setStyle(ButtonStyle.Secondary)
        )
        let totalGuilds
        let totalMembers
        let totalChannels
        let shardSize
        let voiceConnections
        const promises = [
          client.shard.fetchClientValues('guilds.cache.size'),
          client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
          client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.channels.cache.size, 0)),
          client.shard.broadcastEval(c => c.voice?.adapters?.size || 0)
        ];
        await Promise.all(promises)
        .then(results => {
           totalGuilds = results[0].reduce((acc, guildCount) => acc + guildCount, 0);
           totalMembers = results[1].reduce((acc, memberCount) => acc + memberCount, 0);
           totalChannels = results[2].reduce((acc, channelCount) => acc + channelCount, 0);
           shardSize = client.shard.count;
            voiceConnections = results[3].reduce((acc, voiceCount) => acc + voiceCount, 0);
        })
        const embed = new EmbedBuilder()
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setDescription(`**${client.user.username} + Statistics:
          • Owner/Developer: <@891275176409460746>
          • User Count: \`${totalMembers || 0}\`
          • Server Count: \`${totalGuilds || 0}\`
          • Channel Count: \`${totalChannels || 0}\`
          • Shard Count: \`${shardSize || 0}\`
          • Connected Voice: \`${voiceConnections}\`
          • Command Count: \`${client.commands.map(c => c.name).length}\`
          • Operation Time: <t:${Math.floor(Number(Date.now() - client.uptime) / 1000)}:R>
          • Ping: \`${client.ws.ping} MS\`
          • Memory Usage: \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\`
          [Invite Bot](https://discord.com/api/oauth2/authorize?client_id=1005716197259612193&permissions=1067357395521&scope=bot%20applications.commands) /  [Support Server](https://discord.gg/zaskhD7PTW)
          **`)
        .setFooter({ text: `${lang?.RequestBY} ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setColor(lang.COLOR || client.color)
        .setTimestamp()
        .setImage(lang?.banner);
        return interaction.reply({ embeds: [embed], components: [rowC] }).catch(e => { })
      }
      case "editProfile": {
        let rankkk = await db?.ZiUser?.findOne({ userID: interaction?.user.id }).catch(e => { })
        if (rankkk.lvl < 2) return interaction.reply({ content: `${lang?.canlvl2}`, ephemeral: true }).catch(e => { })

        const modal = new ModalBuilder()
          .setCustomId('editProfilemodal')
          .setTitle(`Edit profile ${interaction.user.tag} `)
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('Probcolor')
                .setValue(`${rankkk?.color || client.color}`)
                .setLabel(`Color`)
                .setPlaceholder(`${lang?.hexCOLOR}`)
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('Probimage')
                .setLabel(`Image`)
                .setPlaceholder(`${lang?.langIMG}`)
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
            )
          )

        return interaction?.showModal(modal);
      }
      case "GIUIDProfile": {
        return interaction?.showModal(
          new ModalBuilder()
          .setCustomId('GIUIDProfilemodal')
          .setTitle(`Edit GI UID ${interaction.user.tag} `)
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('uid')
                .setLabel(`uid`)
                .setPlaceholder(`UID`)
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
          )
        ));
      }
      case "refProfile": {
        let props = require(`../../commands/profile`);
        return props.run(lang, interaction, true);
      }
      case "refLeaderboard": {
        let UserI = await db?.ZiUser?.find()
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                UserI.sort((a, b) => b.lvl - a.lvl)
                  .sort((a, b) => b.Xp - a.Xp)
                  .filter(user => client.users.cache.has(user.userID))
                  .slice(0, 10)
                  .map((user, position) => `**${position + 1}** | **${(client.users.cache.get(user.userID).tag)}**: Level: **${user.lvl}** | Xp: **${user.Xp}**`)
                  .join('\n'))
              .setColor(lang.COLOR || client.color)
              .setTitle("Zi bot top 10 leaderboard:")
              .setTimestamp()
              .setFooter({
                text: `${lang?.RequestBY} ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
              })
              .setImage(lang?.banner)
          ],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel("❌")
                .setCustomId("cancel")
                .setStyle(ButtonStyle.Secondary)
            ),
          ],
        });
      }
      default:
        console.log(interaction.customId)
    }
  } catch (e) {
    console.log(e)
  }
}
