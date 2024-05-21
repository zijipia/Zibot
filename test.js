const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    const channel = await client.channels.fetch("1026049479176093828");
    channel.send({content:`test`, components:[
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
            .setCustomId('start_blackjack')
            .setLabel("Blackjack")
            .setStyle(ButtonStyle.Primary)
        )
    ]})
});

const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function getDeck() {
    let deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    return deck;
}

function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function getCardValue(card) {
    if (['J', 'Q', 'K'].includes(card.value)) {
        return 10;
    }
    if (card.value === 'A') {
        return 11;
    }
    return parseInt(card.value);
}

function calculateHandValue(hand) {
    let value = 0;
    let numAces = 0;
    for (let card of hand) {
        value += getCardValue(card);
        if (card.value === 'A') {
            numAces++;
        }
    }
    while (value > 21 && numAces > 0) {
        value -= 10;
        numAces--;
    }
    return value;
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const { customId, user } = interaction;

    if (customId === 'start_blackjack') {
        const deck = shuffle(getDeck());
        const playerHand = [deck.pop(), deck.pop()];
        const dealerHand = [deck.pop(), deck.pop()];

        const playerValue = calculateHandValue(playerHand);
        const dealerValue = calculateHandValue(dealerHand);

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('hit')
                    .setLabel('Hit')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('stand')
                    .setLabel('Stand')
                    .setStyle(ButtonStyle.Secondary),
            );

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Blackjack')
            .setDescription(`Your hand: ${playerHand.map(card => `${card.value} of ${card.suit}`).join(', ')} (Total: ${playerValue})\nDealer's hand: ${dealerHand[0].value} of ${dealerHand[0].suit}, Hidden`);

        await interaction.reply({ embeds: [embed], components: [buttons] });

        client.playerHands.set(user.id, { deck, playerHand, dealerHand });
    } else if (customId === 'hit' || customId === 'stand') {
        const gameState = client.playerHands.get(user.id);
        if (!gameState) {
            return interaction.reply({ content: 'No game found. Start a new game with /start_blackjack.', ephemeral: true });
        }

        const { deck, playerHand, dealerHand } = gameState;

        if (customId === 'hit') {
            playerHand.push(deck.pop());
            const playerValue = calculateHandValue(playerHand);

            if (playerValue > 21) {
                await interaction.update({ content: `You busted! Your hand: ${playerHand.map(card => `${card.value} of ${card.suit}`).join(', ')} (Total: ${playerValue})`, components: [] });
                client.playerHands.delete(user.id);
                return;
            }

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Blackjack')
                .setDescription(`Your hand: ${playerHand.map(card => `${card.value} of ${card.suit}`).join(', ')} (Total: ${playerValue})\nDealer's hand: ${dealerHand[0].value} of ${dealerHand[0].suit}, Hidden`);

            await interaction.update({ embeds: [embed] });
        } else if (customId === 'stand') {
            let dealerValue = calculateHandValue(dealerHand);
            while (dealerValue < 17) {
                dealerHand.push(deck.pop());
                dealerValue = calculateHandValue(dealerHand);
            }

            const playerValue = calculateHandValue(playerHand);

            let result = '';
            if (dealerValue > 21 || playerValue > dealerValue) {
                result = 'You win!';
            } else if (playerValue < dealerValue) {
                result = 'You lose!';
            } else {
                result = 'It\'s a tie!';
            }

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Blackjack')
                .setDescription(`Your hand: ${playerHand.map(card => `${card.value} of ${card.suit}`).join(', ')} (Total: ${playerValue})\nDealer's hand: ${dealerHand.map(card => `${card.value} of ${card.suit}`).join(', ')} (Total: ${dealerValue})\n\n${result}`);

            await interaction.update({ embeds: [embed], components: [] });
            client.playerHands.delete(user.id);
        }
    }
});

client.playerHands = new Map();

// Đăng nhập bot với token của bạn
let config = require("./config")
client.login(config.TOKEN);



(async()=>{
    await player.extractors.loadDefault((ext) => ext !== 'YouTubeExtractor');
})()