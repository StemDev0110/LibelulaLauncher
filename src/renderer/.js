require('dotenv/config');
const { sendInfoEmbed, sendInfoIdeasEmbed } = require('./src/modules/info');
const { Configuration, OpenAIApi } = require('openai');
const compromise = require('compromise');
const fs = require('fs');
const path = require('path');
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  messageLink,
  Attachment,
  AttachmentBuilder,
  VoiceState,
  PermissionsBitField,
} = require('discord.js');
const puppeteer = require('puppeteer');
const imgurUploader = require('imgur-uploader');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.GuildVoiceStates,
  ],
});
//Ai
const config2 = new Configuration({
  apiKey: 'pk-KWwGTPOySNTBEJkSbCiQdqEbnWvhyHAaBxOnnCdVmDxczmAi',
  basePath: 'https://api.pawan.krd/pai-001-light-beta/v1',
});
const config = new Configuration({
  accessToken: process.env.API_KEY_GN,
  organization: process.env.ORG_KEY_GN,
});
const openai2 = new OpenAIApi(config2);
const openai = new OpenAIApi(config);
//Status
const initialStatus = {
  activities: [
    {
      name: 'Blueprint Studio',
      type: 'STREAMING',
    },
  ],
  status: 'dnd',
};

client.once('ready', () => {
  console.log(
    `Se a iniciado session y ya esta en funcionamiento: ${client.user.tag}! | Modulo Principal`,
  );

  client.user.setPresence(initialStatus);
});

client.on('messageCreate', (message) => {
  if (message.content === '!info') {
    sendInfoEmbed(message);
  }
});
client.on('messageCreate', (message) => {
  if (message.content === '!infoideas-team') {
    sendInfoIdeasEmbed(message);
  }
});

const serverId = '1138488642961150052';
client.on('guildMemberAdd', (member) => {
  if (member.guild.id === serverId) {
    const welcomeEmbed = {
      title: '¡Bienvenido al servidor de AdeptusTeam!',
      description:
        'Este servidor de Discord es para trabajar y colaborar en proyectos. Aquí tienes algunas instrucciones:',
      color: 0x0099ff,
      fields: [
        {
          name: 'Requisitos para trabajar:',
          value:
            '1. Descarga la aplicación de Blueprint para colaborar: [Descargar Blueprint](https://adeptus-team.web.app/wiki/blueprint)\n' +
            '2. Proporciona los siguientes datos:\n' +
            '   - Correo Electrónico\n' +
            '   - Cuenta de Twitter\n' +
            '   - Paypal\n' +
            '   - Mini Curriculum\n' +
            'Para proporcionar los datos, escribe primero el correo electrónico, y después te pediremos los siguientes.',
        },
        {
          name: 'Normas del servidor:',
          value:
            'Por favor, respeta las normas y evita faltas de respeto en todo momento.',
        },
      ],
    };

    member
      .send({ embeds: [welcomeEmbed] })
      .then(() =>
        console.log(`Mensaje de bienvenida enviado a ${member.user.tag}`),
      )
      .catch((error) =>
        console.error(`Error al enviar el mensaje de bienvenida: ${error}`),
      );
  }
});

const userProgress = {};

client.on('guildMemberAdd', (member) => {
  if (member.guild.id === serverId) {
    member.send(
      '¡Bienvenido al servidor de AdeptusTeam! Para unirte al equipo, necesitamos algunos detalles importantes de ti. Por favor, comienza proporcionando tu correo electrónico.',
    );

    userProgress[member.id] = { step: 1, data: {} };
  }
});

client.on('messageCreate', async (message) => {
  if (!message.guild) {
    const userId = message.author.id;

    if (userProgress[userId]) {
      const userData = userProgress[userId];

      switch (userData.step) {
        case 1:
          userData.data.email = message.content;
          userData.step++;
          await message.channel.send(
            '¡Gracias! Ahora, por favor, proporciona tu cuenta de Twitter.',
          );
          break;
        case 2:
          userData.data.twitter = message.content;
          userData.step++;
          await message.channel.send(
            'Perfecto, ahora necesitamos tu cuenta de PayPal.',
          );
          break;
        case 3:
          userData.data.paypal = message.content;
          userData.step++;
          await message.channel.send(
            'Por último, envía un resumen de tu mini currículum.',
          );
          break;
        case 4:
          userData.data.miniCurriculum = message.content;
          userData.step++;
          saveUserData(userId, userData.data);
          await message.channel.send(
            '¡Gracias! Tus datos han sido registrados. ¡Bienvenido al equipo!',
          );
          delete userProgress[userId];
          break;
      }
    }
  }
});

function saveUserData(userId, data) {
  const fileName = 'userData.json';
  let userDatabase = {};

  try {
    const fileData = fs.readFileSync(fileName, 'utf8');
    userDatabase = JSON.parse(fileData);
  } catch (err) {
    // Si no existe, se creará uno nuevo
  }

  userDatabase[userId] = data;

  fs.writeFileSync(fileName, JSON.stringify(userDatabase, null, 2), 'utf8');
}

client.on('messageCreate', (message) => {
  if (message.content === '!miinfo') {
    if (message.guild) {
      const userId = message.author.id;

      try {
        const fileData = fs.readFileSync('userData.json', 'utf8');
        const userDatabase = JSON.parse(fileData);

        if (userDatabase[userId]) {
          const userData = userDatabase[userId];
          const userEmbed = {
            title: 'Información del Usuario',
            color: 0x0099ff,
            fields: [
              {
                name: 'Correo Electrónico',
                value: userData.email || 'No proporcionado',
              },
              {
                name: 'Cuenta de Twitter',
                value: userData.twitter || 'No proporcionado',
              },
              {
                name: 'PayPal',
                value: userData.paypal || 'No proporcionado',
              },
              {
                name: 'Mini Currículum',
                value: userData.miniCurriculum || 'No proporcionado',
              },
            ],
          };
          message.channel.send({ embeds: [userEmbed] });
        } else {
          message.channel.send('No tienes información registrada.');
        }
      } catch (err) {
        message.channel.send('Ocurrió un error al cargar la información.');
      }
    } else {
      message.reply('Este comando solo puede ser utilizado en el servidor.');
    }
  }
});

const welcomeChannelId = '1138633832250224690';
client.on('guildMemberAdd', (member) => {
  if (member.guild.id === serverId) {
    const welcomeEmbed = {
      title: '¡Welcome to the AdeptusTeam team!',
      description:
        'We are excited to have you here. Here are some instructions:',
      color: 0x0099ff,
      fields: [
        {
          name: 'Query Your Information command:',
          value:
            'To query your stored information, use the `!miinfo` command on the server.',
        },
        {
          name: 'Instructions:',
          value:
            '1. Provide your email address using `!miinfo` and follow the instructions.\n' +
            '2. Then, provide your Twitter account, PayPal and mini resume by following the bot instructions.\n' +
            '3. Once you have provided all the data, you are ready to join the team.',
        },
        {
          name: 'Instrucciones:',
          value:
            '1. Proporciona tu correo electrónico utilizando `!miinfo` y sigue las instrucciones.\n' +
            '2. Después, proporciona tu cuenta de Twitter, PayPal y mini currículum siguiendo las instrucciones del bot.\n' +
            '3. Una vez que hayas proporcionado todos los datos, estarás listo para unirte al equipo.',
        },
      ],
    };

    const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
    if (welcomeChannel) {
      welcomeChannel.send({ embeds: [welcomeEmbed] });
    }
  }
});

const prefix = '!';
/* client.once("ready", async () => {
  const guiChannelId = "1142518499726606387";
  const guiChannel = client.channels.cache.get(guiChannelId);
  if (guiChannel) {
    try {
      const fetchedMessages = await guiChannel.messages.fetch();
      guiChannel.bulkDelete(fetchedMessages);
    } catch (error) {
      console.error("Error al borrar mensajes:", error);
    }
  } else {
    console.log(`No se encontró el canal con ID: ${guiChannelId}`);
  }

  const browser = await puppeteer.launch({
    headless: "new",
  });
  const page = await browser.newPage();
  await page.goto("https://adeptusteam.github.io/CreationGuide/");

  const screenshot = await page.screenshot();

  fs.writeFileSync("pagina.png", screenshot);
  const img = "./pagina.png";

  try {
    const data = await imgurUploader(fs.readFileSync(img), { title: "Hello!" });
    const imageUrl = data.link;

    const guiChannelId = "1142518499726606387";
    const guiChannel = client.channels.cache.get(guiChannelId);

    if (guiChannel) {
      const embed = new EmbedBuilder()
        .setTitle(
          "Guia de Creacion ! Visitala en: https://adeptusteam.github.io/CreationGuide/"
        )
        .setImage(imageUrl)
        .setDescription(
          "A continuación se muestra la captura de pantalla de la página web en tiempo real:"
        );
      guiChannel.send({ embeds: [embed] });
    } else {
      console.log(`No se encontró el canal con ID: ${guiChannelId}`);
    }

    await browser.close();
  } catch (error) {
    console.error("Error al subir la imagen a Imgur:", error);
  }
}); */

// Cargamos o creamos un archivo JSON para almacenar los horarios
let horarios = {};

try {
  horarios = require('./src/data/horarios.json');
} catch (err) {
  console.error('Error al cargar el archivo de horarios:', err);
}

const awaitingHorario = new Map();

client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Ignorar mensajes de otros bots
  if (!message.content.startsWith(prefix)) return; // Ignorar mensajes que no comienzan con el prefijo

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'horario') {
    // Verificar si el usuario ya tiene un horario registrado
    if (horarios[message.author.id]) {
      // Eliminar el horario antiguo antes de solicitar uno nuevo
      delete horarios[message.author.id];
      fs.writeFileSync(
        './src/data/horarios.json',
        JSON.stringify(horarios, null, 2),
      );
    }

    // Pedir al usuario su horario
    message.reply('Por favor, envía tu horario actual.');

    // Marcar al usuario como esperando una respuesta de horario
    awaitingHorario.set(message.author.id, true);

    // Esperar la respuesta del usuario solo por un tiempo específico
    const filter = (response) => response.author.id === message.author.id;
    const collector = message.channel.createMessageCollector({
      filter,
      time: 60000,
    }); // Tiempo límite de 60 segundos

    collector.on('collect', (userMessage) => {
      const userHorario = userMessage.content;

      // Guardar el horario en el objeto horarios y en el archivo JSON
      horarios[message.author.id] = userHorario;
      fs.writeFileSync(
        './src/data/horarios.json',
        JSON.stringify(horarios, null, 2),
      );

      // Confirmar al usuario que se registró el horario
      userMessage.reply(
        'Horario registrado correctamente. Para ver tu horario registrado, usa el comando "!verhorario".',
      );

      // Detener el colector
      collector.stop();

      // Eliminar la marca de espera para el usuario
      awaitingHorario.delete(message.author.id);
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time' && awaitingHorario.has(message.author.id)) {
        message.reply(
          'Se agotó el tiempo. Debes enviar tu horario en 60 segundos.',
        );
        awaitingHorario.delete(message.author.id); // Eliminar la marca de espera en caso de que el tiempo expire
      }
    });
  } else if (command === 'verhorario') {
    // Verificar si el usuario tiene un horario registrado
    const userHorario = horarios[message.author.id];
    if (userHorario) {
      // Enviar el horario en un embed
      const embed = {
        color: 0x0099ff,
        description: `⏲ Tu horario actual es: ${userHorario}`,
      };

      message.channel.send({ embeds: [embed] });
    } else {
      message.reply(
        'Todavía no tienes un horario registrado. Usa el comando "!horario" para registrarlo.',
      );
    }
  }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  const voiceChannelID = '1170686057101152377';

  // Verificar si el usuario entró al canal de voz específico
  if (newState.channelId === voiceChannelID) {
    const user = newState.member.user;

    try {
      // Crear el objeto JSON con el formato del embed
      const embed = {
        title: 'AFK Notice',
        description: `Hello <@${user.id}>, we have noticed that you are AFK, so you have been moved to a voice channel that consumes less bandwidth (8kbps). ⚡️\n\nThis is to prevent lag issues and ensure a smooth experience. Have a great day! 😊\n\n\n\nHola <@${user.id}>, hemos notado que estás inactivo, por lo que te hemos movido a un canal de voz que consume menos ancho de banda (8kbps). ⚡️\n\nEsto es para evitar problemas de lag y garantizar una experiencia fluida. ¡Que tengas un excelente día! 😊`,
        color: 16763480, // Color verde
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Status report',
        },
      };

      // Enviar el mensaje embed al usuario por mensaje directo
      await user.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error al enviar el mensaje embed:', error);
    }
  }
});

//WORK SISTEM

const dataDirectory = path.join(__dirname, 'src', 'data');
const userDataFilePath = path.join(dataDirectory, 'users_channel_data.json');
const UsersChannelData = {
  users: [],
  channelsid: [],
};
function leerDatosUsersChannel() {
  try {
    if (fs.existsSync(userDataFilePath)) {
      const existingData = fs.readFileSync(userDataFilePath, 'utf8');
      if (existingData) {
        const parsedData = JSON.parse(existingData);
        UsersChannelData.users = parsedData.users;
      }
    }
  } catch (error) {
    console.error(`Error al leer el archivo: ${error}`);
  }
}
leerDatosUsersChannel();

const categoryWorkReport = '1170690734698016858';
const categoryQuery = 'Work Report';

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const newRole = newMember.roles.cache.find(
    (role) => role.id === '1141126907967053926',
  );
  if (!oldMember.roles.cache.has(newRole?.id) && newRole) {
    let channelName = newMember.user.username;
    if (!channelName) {
      console.error('Could not create channel without a valid name');
      return;
    }
    // Agregar sufijo al nombre del canal si no es válido
    if (channelName.length > 98) {
      channelName = channelName.substring(0, 98);
    }
    const guild = newMember.guild;
    let category = guild.channels.cache.find(
      (c) => c.id === categoryWorkReport && c.type === 4,
    );
    if (!category) {
      category = guild.channels.cache.find(
        (c) => c.name === categoryQuery && c.type === 4,
      );
    }
    if (category) {
      let channelNameWithPrefix;
      try {
        const aiResponse = await openai.createCompletion({
          model: 'text-davinci-003',
          prompt: `AI: Hi, I've been created to generate emojis based on your name with a maximum of 2 emojis per name! LionKing: Generate one for my name. AI: 🦁👑. ThePorted: Generate one for my name. AI: 🤝🔌. HypnoStudios: Generate one for my name. AI: 🧠💻. ${channelName}: Generate one for my name. AI:`,
          max_tokens: 7,
        });
        const prefix = aiResponse.data.choices[0].text || '';
        channelNameWithPrefix = `${prefix}»${channelName}`;
      } catch (error) {
        console.error(
          `An error occurred during AI response generation: ${error}`,
        );
      }

      guild.channels
        .create({
          name: channelNameWithPrefix,
          type: 0,
          parent: category.id,
          permissionOverwrites: [
            {
              id: guild.roles.everyone.id,
              deny: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
              ],
            },
            {
              id: newMember.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
              ],
            },
          ],
        })
        .then(async (channel) => {
          const embed = {
            title: 'Que es esto? - What is this?',
            description:
              '🇺🇸\n```> Work done for: (AdeptusTeam/Private/Public/Other, if other you must specify for whom it was done)\n» Money Earned: (Money received)\n> Help: (Person who contributed to the job.)\n> Image of the job: (Well-detailed image.)\n- Description *(Description of the work)*\n\n**Work: (Send file of work done, such as schematic, illustration, model, schematic in case of construction, etc.) **```\n🇪🇸\n```> Trabajo realizado para: (AdeptusTeam/Privado/Publico/Otro, en caso de ser otro debes especificar para quien fue realizado.)\n» Dinero Ganado: (Dinero recibido)\n> Ayuda: (Persona que aporto en el trabajo.)\n> Imagen del trabajo: (Imagen bien detallada.)\n- Descripción *(Descripción de la obra)*\n\n**Trabajo: (Enviar archivo de trabajo realizado, como schematic, ilustraicon, modelo, schematic en caso de construccion, etc.)**```',
            color: 0x58b9ff,
            author: {
              name: 'AdeptusTeam',
            },
          };

          channel
            .send({ content: `<@${newMember.id}>`, embeds: [embed] })
            .then(() => {
              // Después de enviar el mensaje, agregué el ID del canal a la matriz
              UsersChannelData.channelsid.push(channel.id);

              // Guarda la información actualizada en el archivo JSON
              try {
                if (!fs.existsSync(dataDirectory)) {
                  fs.mkdirSync(dataDirectory, { recursive: true });
                }

                fs.writeFileSync(
                  userDataFilePath,
                  JSON.stringify(UsersChannelData),
                  'utf8',
                );
              } catch (error) {
                console.error(`Error al escribir en el archivo: ${error}`);
              }
            })
            .catch((error) => {
              console.error(
                `Could not send message to channel ${channel.name}: ${error}`,
              );
            });
        })
        .catch((error) => {
          console.error(
            `Could not create channel in category ${category.name}: ${error}`,
          );
          createChannelWithoutCategory(guild, channelName, newMember);
        });
    } else {
      console.error(
        `Could not find category with ID ${categoryWorkReport} or name "${categoryQuery}"`,
      );
      createChannelWithoutCategory(guild, channelName, newMember);
    }
  }
  // Verificar si el archivo JSON existe antes de intentar leerlo
  if (fs.existsSync(userDataFilePath)) {
    // Verificar si el ID de usuario ya existe en la matriz
    if (!UsersChannelData.users.includes(newMember.id)) {
      // Después de crear el canal y enviar el mensaje
      UsersChannelData.users.push(newMember.id);

      // Guardar la información actualizada en el archivo JSON
      try {
        if (!fs.existsSync(dataDirectory)) {
          fs.mkdirSync(dataDirectory, { recursive: true });
        }

        fs.writeFileSync(
          userDataFilePath,
          JSON.stringify(UsersChannelData),
          'utf8',
        );
        leerDatosUsersChannel();
      } catch (error) {
        console.error(`Error al escribir en el archivo: ${error}`);
      }
    }
  }
});

function createChannelWithoutCategory(guild, channelName, newMember) {
  guild.channels
    .create({
      name: channelName,
      type: 0,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
        {
          id: newMember.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
      ],
    })
    .catch((error) => {
      console.error(`Could not create channel without category: ${error}`);
    });
}
const channelWorkReportID = UsersChannelData.channelsid;

const targetchannelWorkReportID = '1170704501422952488';
const checkEmoji = '✅';
const starEmoji = '🌟';

client.on('messageCreate', (msg) => {
  if (channelWorkReportID.includes(msg.channel.id)) {
    msg.react(checkEmoji);
  }
});
client.on('messageCreate', (msg) => {
  if (targetchannelWorkReportID.includes(msg.channel.id)) {
    msg.react(starEmoji);
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (
    reaction.emoji.name === checkEmoji &&
    channelWorkReportID.includes(reaction.message.channel.id) &&
    !user.bot
  ) {
    const targetChannel = client.channels.cache.get(targetchannelWorkReportID);
    const originalMessage = await reaction.message.fetch();
    try {
      const aiResponseCal = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `AI:I am an ai created to grade jobs(Illustrations, Constructions, Programming, and so on) according to the performance of the message(I can speak your language with the one you speak to me initially, actually I can speak practically all languages!) from 0 - 100.
                 LionKing: Trabajo realizado para: HypnoStudios
                 Tipo de trabajo: Construcción
                 » Dinero Ganado: $500
                 » LanguajeToTalk: Spanish
                 Ayuda: Ninguna
                 Imagen del trabajo: proyects.hypnostudios.rf.gd/build/LionKing/Latest
                 Descripción: Este proyecto consistió en la construcción de un complejo de castillos medievales en Minecraft para HypnoStudios. Los castillos fueron diseñados con gran detalle, incluyendo murallas, torres de vigilancia, salones de banquetes y jardines. El trabajo se completó en un plazo de dos semanas y se recibió un pago de $500 por el proyecto. El proyecto fue realizado de manera individual, sin ninguna ayuda adicional. La imagen adjunta muestra una vista panorámica del complejo de castillos en todo su esplendor.
                 AI: Calificacion: 80/100, esta se debe a que no hiciste o no comentaste una decoracion interior, paisajismo y entorno, mayor diversidad de diseños y interactividad,
                 Grafico de Barras:
                    A|⬛⬛⬛⬛⬛
                    C|🟪🟪🟪⬛⬛
                    R|🟪🟪🟪⬛⬛
                    V|🟪🟪🟪🟪⬛
                    C|🟪🟪🟪🟪⬛
                    T|🟪🟪🟪🟪⬛
                    S|🟪🟪🟪🟪🟪
                    D|🟪🟪🟪⬛⬛
                    G|🟪🟪🟪🟪⬛
                    Lvl|1  2  3  4  5

                    A= Ayuda = 0 (No recibiste ayuda)
                    P= Creatividad = 3
                    R= Interactividad y Rendimiento = 3
                    V= Velocidad y Tiempo = 4
                    C= Capacidad y Calidad = 4
                    T= Tematica = 4
                    S= Tamaño = 5
                    D= Desarrollo y Decoracion = 3
                    G= General = 4,5.

                 KyoLord: Trabalho efectuado para: HypnoStudios
                 Tipo de trabalho: Desenvolvimento de um tradutor e assistente virtual
                 » Dinheiro ganho: $3500
                 » LanguajeToTalkToTalk: Portugues
                 Ajuda: 2 pessoas
                 Imagem da obra: proyects.hypnostudios.rf.gd/build/KyoLord/Latest
                 Descrição: O projecto consistiu no desenvolvimento de um tradutor(foram necessários 2 meses para terminar o trabalho) e de um assistente de conversação virtual para facilitar a comunicação entre utilizadores de diferentes línguas. O sistema foi concebido para fornecer traduções precisas e permitir interacções suaves em tempo real.
                 AI: Classificação: 85/100. Bom trabalho no desenvolvimento do tradutor e do assistente virtual. Teria sido benéfico fornecer mais detalhes sobre a contribuição dos seus colaboradores e as características técnicas implementadas. Além disso, considere a possibilidade de adicionar um sistema de preços baseado no tipo de utilizador e no número de traduções efectuadas. Continue a aperfeiçoar as suas competências e a explorar novas oportunidades para melhorar os seus projectos futuros
                 Grafico de Barras:
                    A|🟪🟪⬛⬛⬛
                    C|🟪🟪🟪🟪⬛
                    R|🟪🟪🟪🟪⬛
                    V|🟪🟪🟪🟪🟪
                    C|🟪🟪🟪🟪⬛
                    T|🟪🟪🟪🟪🟪
                    S|🟪🟪🟪🟪🟪
                    D|🟪🟪⬛⬛⬛
                    G|🟪🟪🟪🟪⬛
                    Lvl|1  2  3  4  5

                    A= Ajuda = 2 (Recebeu Apoio)
                    P= Criatividade = 4
                    R= Interactividade e desempenho = 4
                    V= Velocidade e tempo = 5
                    C= Capacidade e qualidade = 4
                    T= Temático = 5
                    S= Tamanho = 5
                    D= Desenvolvimento e decoração = 2
                    G= Global = 4.5.

                 Octopus: Work done for: HypnoStudios
                 Type of work: Ilustracion
                 » Money Earned: $50
                 » LanguajeToTalk: English
                 Help: 1 Person
                 Image of the work: proyects.hypnostudios.rf.gd/build/Octopus/Latest
                 Description: The illustration is a complete banner of 1024 x 512 which was made for a community, this was done in 1 week with the help of a colleague who made the textures.
                 AI: Rating: 75/100, this is because you didn't do or comment on the help your colleague provided, you didn't give much detail either, overall it sounds good, but you did or didn't comment on having to use fonts for different things, also using an organization system to get the job done faster,
                 Bar Chart:
                    A|🟪⬛⬛⬛⬛
                    C|🟪🟪⬛⬛⬛
                    R|🟪🟪🟪⬛⬛
                    V|🟪🟪🟪⬛⬛
                    C|🟪🟪⬛⬛⬛
                    T|🟪🟪🟪⬛⬛
                    S|🟪🟪🟪🟪🟪
                    D|🟪🟪🟪⬛⬛
                    G|🟪🟪🟪🟪⬛
                    Lvl|1  2  3  4  5

                    A= Help = 1 (you received some help)
                    P= Creativity = 2
                    R= Interactivity and Performance = 3
                    V= Speed and Time = 3
                    C= Capacity and Quality = 2
                    T= Thematic = 3
                    S= Size = 5
                    D= Development and Decoration = 3
                    G= General = 3.5.

                 ${originalMessage.author.username}:${originalMessage.content}
                 AI:`,
        max_tokens: 700,
      });
      const calificacion = aiResponseCal.data.choices[0].text || '';
      console.log(calificacion);
      try {
        const aiResponseMej = await openai.createCompletion({
          model: 'text-davinci-003',
          prompt: `AI:I am an ai created to help in improvements on work done and improvements in general on a message (I can speak your language with the one you speak to me initially, actually I can speak practically all languages!).
                 LionKing: »LanguajeToTalk: Spanish
                 E creado una interfaz en el server de HypnoStudios en Minecraft la cual usa un Resourcepack para mejorar la vision, esta tambien cuenta con animaciones y sonidos custom, para esto programe un plugin, para la 1.19.2.
                 AI:En general es una buena interfaz, cuenta con muchas cosas las cuales la hacen una buena interfaz, como el resourcepack la cual la vuelve mas bonita a la vista y demas, en general es un 100/100, aparte que cuenta con un plugin lo cual hace que este mas optimizado, pero podrias a la siguiente hacerlo apartir de mods si es un server hybrido como magma, y en todo caso tambien te recomendaria usar modelos 3d en tu resourcepack, tambien as el resourcepack con vanilla y sin complementos de ayuda como cit de optifine.
                 Octopus: »LanguajeToTalk: English
                 I created an illustration with blender, I received some help and it was something for a client, it was something simple and I was helped by a member of the team in general it took me 1 week with it because we were not organized properly.
                 AI:Well, it seems your work was not a very correct one in terms of organization as you tell me, you didn't specify much of it either from what I understand, you should improve the teamwork aspect, do the work in less time as it is something easy to do when someone helps you. In general, being more specific and detailed in the description of the creation process, the collaborations and the challenges faced would allow a better understanding of how the project was carried out and how it could be improved in the future.
                 KyoLord: »LanguajeToTalk: Portugues
                 Desenvolvi um aplicativo web de desktop remoto com funcionalidade de FTP para um cliente. Fizemos uma organização adequada e concluímos o projeto dentro do prazo esperado.
                 AI:Parabéns por desenvolver um aplicativo web de desktop remoto com funcionalidade de FTP para seu cliente. A colaboração efetiva e a organização adequada foram fundamentais para concluir o projeto dentro do prazo estabelecido. Continue com o bom trabalho!.
                 ${originalMessage.author.username}:${originalMessage.content}
                 AI:`,
          max_tokens: 500,
        });
        const mejoras = aiResponseMej.data.choices[0].text || '';
        console.log(mejoras);
        try {
          const aiResponseOpi = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: `AI:I am an ai who is able to give my opinion (I can speak your language with which you speak to me initially, actually I can speak practically all languages!) on certain issues, as long as it follows the HypnoStudios policy and is not an illegal act.
                 LionKing: »LanguajeToTalk: Spanish
                 E estado teniendo problemas al crear mi plugin ya que no se como empezar a programarlo ya que es para un cliente de la compañia y debe ser en java, es muy complejo y no se empezar.
                 AI:Hmm, entiendo, en tu caso te recomiendo estar esta ultima semana aprendiendo a programar en videos de youtube, puedes seguir a youtubers que saben del tema como: "PogoStick29Dev, CodeZealot, ElCodigo7, SimplySarc, McTsts"
                 SSamusDev: »LanguajeToTalk: English
                 I've been creating a cinematic animation but as I didn't know about it I chose Cinema4d, since blender was too complicated for me.
                 AI:You had a good choice as it is an easy thing to start with, but you should in the **Future** to make things easier for yourself go for bigger things like blender and learn more about it.
                 KyoLord: »LanguajeToTalk: Portugues
                 Desenvolvi um bot para Minecraft com funcionalidades avançadas, como automação de tarefas e interação com o ambiente do jogo.
                 AI:Foi uma boa escolha desenvolver um bot para Minecraft, pois permite automatizar tarefas e interagir com o jogo de forma mais eficiente. No entanto, para futuros projetos, seria interessante explorar ferramentas mais avançadas, como desenvolver plugins personalizados usando a API do Bukkit ou Spigot, para ampliar ainda mais as funcionalidades e personalização do bot. Isso abriria novas possibilidades e permitiria um maior domínio sobre o desenvolvimento de mods e extensões no jogo. Continuar aprendendo e explorando recursos mais complexos pode ajudar a aprimorar ainda mais suas habilidades de desenvolvimento em Minecraft.
                 ${originalMessage.author.username}:${originalMessage.content}
                 AI:`,
            max_tokens: 500,
          });
          const opiniones = aiResponseOpi.data.choices[0].text || '';
          console.log(opiniones);
          const embed = {
            title: `Informe Publico de ${originalMessage.author.username}`,
            description: `<:alerta:1102280880149504072> Work Report of: ${originalMessage.author.username} <:alerta:1102280880149504072> \n\n${originalMessage.content}\n\n**Calificacion/Qualification º**\n\n${calificacion}`,
            color: 7952639,
            fields: [
              {
                name: 'Mejoras/Improvements º',
                value: `${mejoras}`,
              },
              {
                name: 'Opiniones/Opinions º',
                value: `${opiniones}`,
              },
            ],
            author: {
              name: 'AdeotusTeam Inform',
            },
            image: {
              url: originalMessage.attachments.map(
                (attachment) => attachment.url,
              )[0],
            },
          };
          targetChannel.send({ embeds: [embed] }).catch((error) => {
            console.error(
              'Error al enviar el mensaje embed sobre estadisticas y demas de WorkReport:',
              error,
            );
          });
        } catch (error) {
          console.error('Error en el bloque try de aiResponseOpi:', error);
        }
      } catch (error) {
        console.error('Error en el bloque try de aiResponseMej:', error);
      }
    } catch (error) {
      console.error('Error en el bloque try de aiResponseCal:', error);
    }
  }
});

client.on('messageCreate', async (message) => {
  // Verificar si el mensaje se encuentra en el canal de texto específico
  if (message.channel.id === '1170682934181761054') {
    // Verificar si el autor del mensaje no es un bot
    if (!message.author.bot) {
      // Verificar si el contenido del mensaje es aceptable como review
      const contenidoAceptable = verificarContenidoAceptable(message.content);

      if (contenidoAceptable) {
        // Crear el objeto JSON con el formato del embed
        const embed = {
          color: 5814783,
          description: message.content,
          image: {
            url: 'https://i.pinimg.com/originals/c9/e8/ef/c9e8efca356e9fd2263493d78ab3737d.gif',
          },
          title: `Idea of ${message.author.username}`,
          author: {
            name: message.author.tag,
            icon_url: message.author.displayAvatarURL(),
          },
          timestamp: message.createdAt.toISOString(),
          footer: {
            text: `Message Data: ${message.createdAt.toISOString()}`,
          },
        };

        try {
          // Enviar el embed en el mismo canal
          const sentMessage = await message.channel.send({ embeds: [embed] });

          // Reaccionar al embed con el emoji de estrella
          await sentMessage.react('💎');
        } catch (error) {
          console.error('Error al reenviar el mensaje:', error);
        }

        // Eliminar el mensaje original del usuario
        await message.delete();
      } else {
        // El contenido del mensaje no es aceptable como review, puedes realizar alguna acción, como enviar una advertencia al autor del mensaje.
        await message.author.send(
          '`Warn`\n\nYour message does not meet the criteria to be accepted as an idea.\n\nTu mensaje no cumple con los criterios para ser aceptado como una idea.',
        );

        // Eliminar el mensaje original del usuario
        await message.delete();
      }
    }
  }
});

function verificarContenidoAceptable(contenido) {
  // Verificar si el mensaje contiene palabras ofensivas
  const palabrasOfensivas = [
    'mierda',
    'cabrón',
    'cabrona',
    'pendejo',
    'pendeja',
    'joder',
    'jodido',
    'jodida',
    'puto',
    'puta',
    'gilipollas',
    'idiota',
    'imbécil',
    'huevón',
    'huevona',
    'cagada',
    'cagar',
    'maldito',
    'maldita',
    'coño',
    'maricón',
    'marica',
    'shit',
    'asshole',
    'fuck',
    'fucker',
    'dick',
    'bitch',
    'bastard',
    'motherfucker',
  ];
  for (const palabra of palabrasOfensivas) {
    if (contenido.toLowerCase().includes(palabra.toLowerCase())) {
      return false;
    }
  }

  // Tokenizar el contenido del mensaje utilizando compromise
  const tokens = compromise(contenido).terms().data();

  // Verificar si el mensaje contiene al menos una palabra sustantiva
  const contieneSustantivo = tokens.some((token) =>
    token.tags.includes('Noun'),
  );

  // Verificar si el mensaje contiene al menos una oración con sentido
  const contieneOracionConSentido =
    compromise(contenido).sentences().length > 0;

  return contieneSustantivo && contieneOracionConSentido;
}

//AI TEST
client.once('ready', async () => {
  try {
    console.log('Ready!');
    const aiResponseMej = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `AI:I am an ai created to help in improvements on work done and improvements in general on a message (I can speak your language with the one you speak to me initially, actually I can speak practically all languages!).
             LionKing: »LanguajeToTalk: Spanish
             E creado una interfaz en el server de HypnoStudios en Minecraft la cual usa un Resourcepack para mejorar la vision, esta tambien cuenta con animaciones y sonidos custom, para esto programe un plugin, para la 1.19.2.
             AI:En general es una buena interfaz, cuenta con muchas cosas las cuales la hacen una buena interfaz, como el resourcepack la cual la vuelve mas bonita a la vista y demas, en general es un 100/100, aparte que cuenta con un plugin lo cual hace que este mas optimizado, pero podrias a la siguiente hacerlo apartir de mods si es un server hybrido como magma, y en todo caso tambien te recomendaria usar modelos 3d en tu resourcepack, tambien as el resourcepack con vanilla y sin complementos de ayuda como cit de optifine.
             Octopus: »LanguajeToTalk: English
             I created an illustration with blender, I received some help and it was something for a client, it was something simple and I was helped by a member of the team in general it took me 1 week with it because we were not organized properly.
             AI:Well, it seems your work was not a very correct one in terms of organization as you tell me, you didn't specify much of it either from what I understand, you should improve the teamwork aspect, do the work in less time as it is something easy to do when someone helps you. In general, being more specific and detailed in the description of the creation process, the collaborations and the challenges faced would allow a better understanding of how the project was carried out and how it could be improved in the future.
             KyoLord: »LanguajeToTalk: Portugues
             Desenvolvi um aplicativo web de desktop remoto com funcionalidade de FTP para um cliente. Fizemos uma organização adequada e concluímos o projeto dentro do prazo esperado.
             AI:Parabéns por desenvolver um aplicativo web de desktop remoto com funcionalidade de FTP para seu cliente. A colaboração efetiva e a organização adequada foram fundamentais para concluir o projeto dentro do prazo estabelecido. Continue com o bom trabalho!.
             ${originalMessage.author.username}:${originalMessage.content}
             AI:`,
      max_tokens: 500,
    });

    console.log(
      `AI Loaded Correctly, Sistem: You are working correctly ?:` +
        response.data.choices[0].text,
    );
  } catch {
    console.error('AI ERROR');
  }
});

const managerRoleId = '1122343454635';
let pointsData = require('./data.json');
client.on('message', (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'points') {
    // Comando para añadir puntos
    if (message.member.roles.cache.some((role) => role.id === managerRoleId)) {
      const targetUser = message.mentions.users.first();
      const pointsToAdd = parseInt(args[1], 10) || 0;

      if (!targetUser) {
        return message.reply('Debes mencionar a un usuario.');
      }

      if (!pointsData[targetUser.id]) {
        pointsData[targetUser.id] = 0;
      }

      pointsData[targetUser.id] += pointsToAdd;

      // Guardar datos en el archivo JSON
      fs.writeFileSync('./data.json', JSON.stringify(pointsData, null, 2));

      return message.reply(
        `Se han añadido ${pointsToAdd} puntos a ${
          targetUser.username
        }. Total de puntos: ${pointsData[targetUser.id]}`,
      );
    } else {
      return message.reply('No tienes permisos para usar este comando.');
    }
  }

  if (command === 'usepoints') {
    // Comando para quitar puntos
    if (message.member.roles.cache.some((role) => role.id === managerRoleId)) {
      const targetUser = message.mentions.users.first();
      const pointsToUse = parseInt(args[1], 10) || 0;

      if (!targetUser) {
        return message.reply('Debes mencionar a un usuario.');
      }

      if (!pointsData[targetUser.id]) {
        pointsData[targetUser.id] = 0;
      }

      if (pointsData[targetUser.id] < pointsToUse) {
        return message.reply('El usuario no tiene suficientes puntos.');
      }

      pointsData[targetUser.id] -= pointsToUse;

      // Guardar datos en el archivo JSON
      fs.writeFileSync('./data.json', JSON.stringify(pointsData, null, 2));

      return message.reply(
        `Se han quitado ${pointsToUse} puntos a ${
          targetUser.username
        }. Total de puntos: ${pointsData[targetUser.id]}`,
      );
    } else {
      return message.reply('No tienes permisos para usar este comando.');
    }
  }
});

client.login(process.env.TOKEN);
