const yt = require('ytdl-core');

let queue = {};

const commands = {
    '�al': (msg) => {
        if (queue[msg.guild.id] === undefined) return msg.channel.send(`**�lk �nce �ark� eklemelisin. �rne�in: ${prefix}ekle YOUTUBEL�NK�**`);
        if (!msg.guild.voiceConnection) return commands.join(msg).then(() => commands.play(msg));
        if (queue[msg.guild.id].playing) return msg.channel.send('**Zaten ayn� �ark� �al�n�yor.**');
        let dispatcher;
        queue[msg.guild.id].playing = true;

        console.log(queue);
        (function play(song) {
            console.log(song);
            if (song === undefined) return msg.channel.send('**S�radaki �ark�lar bitti**').then(() => {
                queue[msg.guild.id].playing = false;
                msg.member.voiceChannel.leave();
            });
            msg.channel.send(`d �al�nan: **${song.title}** Ekleyen: **${song.requester}**`);
            dispatcher = msg.guild.voiceConnection.playStream(yt(song.url, { audioonly: true }), { passes : "1" });
            let collector = msg.channel.createCollector(m => m);
            collector.on('message', m => {
                if (m.content.startsWith(prefix + 'durdur')) {
                    msg.channel.send('d **Durduruldu.**').then(() => {dispatcher.pause();});
                } else if (m.content.startsWith(prefix + 'devam')){
                    msg.channel.send('d **Devam ediyor.**').then(() => {dispatcher.resume();});
                } else if (m.content.startsWith(prefix + 'ge�')){
                    msg.channel.send('d **Ge�ildi.**').then(() => {dispatcher.end();});
                } else if (m.content.startsWith(prefix + 'ses+')){
                    if (Math.round(dispatcher.volume*50) >= 100) return msg.channel.send(`d **Ses: ${Math.round(dispatcher.volume*50)}%**`);
                    dispatcher.setVolume(Math.min((dispatcher.volume*50 + (2*(m.content.split('+').length-1)))/50,2));
                    msg.channel.send(`d **Ses: ${Math.round(dispatcher.volume*50)}%**`);
                } else if (m.content.startsWith(prefix + 'ses-')){
                    if (Math.round(dispatcher.volume*50) <= 0) return msg.channel.send(`**d Ses: ${Math.round(dispatcher.volume*50)}%**`);
                    dispatcher.setVolume(Math.max((dispatcher.volume*50 - (2*(m.content.split('-').length-1)))/50,0));
                    msg.channel.send(`d **Ses: ${Math.round(dispatcher.volume*50)}%**`);
                } else if (m.content.startsWith(prefix + 'bilgi')){
                    msg.channel.send(`d **Ge�en zaman: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000)/1000) <10 ? '0'+Math.floor((dispatcher.time % 60000)/1000) : Math.floor((dispatcher.time % 60000)/1000)}**`);
                }
            });
            dispatcher.on('end', () => {
                collector.stop();
                play(queue[msg.guild.id].songs.shift());
            });
            dispatcher.on('error', (err) => {
                return msg.channel.send('error: ' + err).then(() => {
                    collector.stop();
                    play(queue[msg.guild.id].songs.shift());
                });
            });
        })(queue[msg.guild.id].songs.shift());
    },
    'gir': (msg) => {
        return new Promise((resolve, reject) => {
            const voiceChannel = msg.member.voiceChannel;
            if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply('**�lk �nce sesli kanala girmelisin.**');
            voiceChannel.join().then(connection => resolve(connection)).catch(err => reject(err));
        });
    },
    '��k': (msg) => {
        return new Promise((resolve, reject) => {
            const voiceChannel = msg.member.voiceChannel;
            if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply('**�lk �nce sesli kanalda olmal�s�n.**');
            voiceChannel.leave().then(connection => resolve(connection)).catch(err => reject(err));
        });
    },
    'ekle': (msg) => {
        let url = msg.content.split(' ')[1];
        if (url == '' || url === undefined) return msg.channel.send(`**Youtube linki koymal�s�n. �rne�in: ${prefix}ekle YOUTUBEL�NK�**`);
        yt.getInfo(url, (err, info) => {
            if(err) return msg.channel.send('**Link ge�ersiz:** ' + err);
            if (!queue.hasOwnProperty(msg.guild.id)) queue[msg.guild.id] = {}, queue[msg.guild.id].playing = false, queue[msg.guild.id].songs = [];
            queue[msg.guild.id].songs.push({url: url, title: info.title, requester: msg.author.username});
            msg.channel.send(`d **${info.title}** adl� �ark� s�raya eklenmi�tir.`);
        });
    },
    's�ra': (msg) => {
        if (queue[msg.guild.id] === undefined) return msg.channel.send(`Sunucunun eklenmi� �ark�s� bulunmuyor. Eklemek i�in: ${prefix}ekle YOUTUBEL�NK�`);
        let tosend = [];
        queue[msg.guild.id].songs.forEach((song, i) => { tosend.push(`${i+1}. ${song.title} - Ekleyen: ${song.requester}`);});
        msg.channel.send(`d **${msg.guild.name} adl� sunucunun m�zik kuyru�u:** �u anda **${tosend.length}** adet �ark� var. ${(tosend.length > 15 ? '*[15 tanesi g�steriliyor]*' : '')}\n\`\`\`${tosend.slice(0,15).join('\n')}\`\`\``);
    },
    'yard�m': (msg) => {
        let tosend = ['` ``xl', prefix + 'gir : "Sesli kanal�n�za girer."', prefix + '��k : "Sesli kanal�n�zdan ��kar."',    prefix + 'ekle : "Yazd���n�z Youtube linkini s�raya ekler."', prefix + 's�ra : "Sunucudaki m�zik s�ras�n� g�sterir."', prefix + '�al : "S�radaki �ark�lar� �alar."', '', 'di�er komutlar:'.toUpperCase(), prefix + 'durdur : "�alan �ark�y� durdurur."',    prefix + 'devam : "Durdurulan �ark�y� devam ettirir."', prefix + 'ge� : "�al�nan �ark�y� s�radaki �ark�ya ge�er."', prefix + 'bilgi : "�alan �ark� hakk�nda bilgiler verir."',    prefix + 'ses+(+++) : "�ark� sesini y�kseltir."',    prefix + 'ses-(---) : "�ark� sesini azalt�r."',    '`` `'];
        msg.channel.send(tosend.join('\n'));
    },
(d�zenlendi)
    'm�zikler': (msg) => {
      msg.channel.send(`d M�zik �al�nan sunucu say�s�: **${client.voiceConnections.size}**`)
    },
    'davet': (msg) => {
        const embed = new Discord.RichEmbed()
            .setDescription(`Davet linkim i�in [�zerime t�kla.](https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&permissions=2146958527&scope=bot)`)
        msg.channel.send(embed);    
  }
};

client.on('message', msg => {
    if (!msg.content.startsWith(prefix)) return;
    if (commands.hasOwnProperty(msg.content.toLowerCase().slice(prefix.length).split(' ')[0])) commands[msg.content.toLowerCase().slice(prefix.length).split(' ')[0]](msg);
});