const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const translate = require('@iamtraction/google-translate');
const ISO6391 = require('iso-639-1');
const client = require('../bot');
const { ZifetchInteraction } = require('../events/Zibot/ZiFunc');

module.exports = {
    name: "translate",
    description: "Translate any language into user language.",
    options: [{
        name: "transtext",
        description: "Enter the text you want to translate.",
        type: 3,
        required: true,
      }],
    cooldown: 3,
    NODMPer: false,
    dm_permission: true,
  };

module.exports.run = async (lang, interaction) => {
    let mess = await ZifetchInteraction(interaction);
      const args = interaction.options.getString('transtext');
      const translated = await translate(args, { to: lang?.langdef || "vi" });
      let language_name = ISO6391.getName(`${translated.from.language.iso}`);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('❌')
          .setCustomId('cancel')
          .setStyle(ButtonStyle.Secondary));

      const embed = new EmbedBuilder()
        .setColor(lang.COLOR || client.color)
        .setTitle(`Translate:`)
        .setDescription(`${translated.text}`)
        .setTimestamp()
        .setFooter({ text: ` ${language_name}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })

      return mess.edit({ content:``, embeds: [embed], components: [row] }).then( setTimeout( async() => {
            return mess.edit({ content:``, embeds: [embed], components: [] }).catch(e => { })
      }, 30000)).catch(e => { });

}