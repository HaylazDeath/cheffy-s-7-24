const yt = require('ytdl-core');

let queue = {};

const commands = {
    'çal': (msg) => {
        if (queue[msg.guild.id] === undefined) return msg.channel.send(`**Ýlk önce þarký eklemelisin. Örneðin: ${prefix}ekle YOUTUBELÝNKÝ**`);
        if (!msg.guild.voiceConnection) return commands.join(msg).then(() => commands.play(msg));
        if (queue[msg.guild.id].playing) return msg.channel.send('**Zaten ayný þarký çalýnýyor.**');
        let dispatcher;
        queue[msg.guild.id].playing = true;

        console.log(queue);
        (function play(song) {
            console.log(song);
            if (song === undefined) return msg.channel.send('**Sýradaki þarkýlar bitti**').then(() => {
                queue[msg.guild.id].playing = false;
                msg.member.voiceChannel.leave();
            });
            msg.channel.send(`d Çalýnan: **${song.title}** Ekleyen: **${song.requester}**`);
            dispatcher = msg.guild.voiceConnection.playStream(yt(song.url, { audioonly: true }), { passes : "1" });
            let collector = msg.channel.createCollector(m => m);
            collector.on('message', m => {
                if (m.content.startsWith(prefix + 'durdur')) {
                    msg.channel.send('d **Durduruldu.**').then(() => {dispatcher.pause();});
                } else if (m.content.startsWith(prefix + 'devam')){
                    msg.channel.send('d **Devam ediyor.**').then(() => {dispatcher.resume();});
                } else if (m.content.startsWith(prefix + 'geç')){
                    msg.channel.send('d **Geçildi.**').then(() => {dispatcher.end();});
                } else if (m.content.startsWith(prefix + 'ses+')){
                    if (Math.round(dispatcher.volume*50) >= 100) return msg.channel.send(`d **Ses: ${Math.round(dispatcher.volume*50)}%**`);
                    dispatcher.setVolume(Math.min((dispatcher.volume*50 + (2*(m.content.split('+').length-1)))/50,2));
                    msg.channel.send(`d **Ses: ${Math.round(dispatcher.volume*50)}%**`);
                } else if (m.content.startsWith(prefix + 'ses-')){
                    if (Math.round(dispatcher.volume*50) <= 0) return msg.channel.send(`**d Ses: ${Math.round(dispatcher.volume*50)}%**`);
                    dispatcher.setVolume(Math.max((dispatcher.volume*50 - (2*(m.content.split('-').length-1)))/50,0));
                    msg.channel.send(`d **Ses: ${Math.round(dispatcher.volume*50)}%**`);
                } else if (m.content.startsWith(prefix + 'bilgi')){
                    msg.channel.send(`d **Geçen zaman: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000)/1000) <10 ? '0'+Math.floor((dispatcher.time % 60000)/1000) : Math.floor((dispatcher.time % 60000)/1000)}**`);
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
            if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply('**Ýlk önce sesli kanala girmelisin.**');
            voiceChannel.join().then(connection => resolve(connection)).catch(err => reject(err));
        });
    },
    'çýk': (msg) => {
        return new Promise((resolve, reject) => {
            const voiceChannel = msg.member.voiceChannel;
            if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply('**Ýlk önce sesli kanalda olmalýsýn.**');
            voiceChannel.leave().then(connection => resolve(connection)).catch(err => reject(err));
        });
    },
    'ekle': (msg) => {
        let url = msg.content.split(' ')[1];
        if (url == '' || url === undefined) return msg.channel.send(`**Youtube linki koymalýsýn. Örneðin: ${prefix}ekle YOUTUBELÝNKÝ**`);
        yt.getInfo(url, (err, info) => {
            if(err) return msg.channel.send('**Link geçersiz:** ' + err);
            if (!queue.hasOwnProperty(msg.guild.id)) queue[msg.guild.id] = {}, queue[msg.guild.id].playing = false, queue[msg.guild.id].songs = [];
            queue[msg.guild.id].songs.push({url: url, title: info.title, requester: msg.author.username});
            msg.channel.send(`d **${info.title}** adlý þarký sýraya eklenmiþtir.`);
        });
    },
    'sýra': (msg) => {
        if (queue[msg.guild.id] === undefined) return msg.channel.send(`Sunucunun eklenmiþ þarkýsý bulunmuyor. Eklemek için: ${prefix}ekle YOUTUBELÝNKÝ`);
        let tosend = [];
        queue[msg.guild.id].songs.forEach((song, i) => { tosend.push(`${i+1}. ${song.title} - Ekleyen: ${song.requester}`);});
        msg.channel.send(`d **${msg.guild.name} adlý sunucunun müzik kuyruðu:** Þu anda **${tosend.length}** adet þarký var. ${(tosend.length > 15 ? '*[15 tanesi gösteriliyor]*' : '')}\n\`\`\`${tosend.slice(0,15).join('\n')}\`\`\``);
    },
    'yardým': (msg) => {
        let tosend = ['` ``xl', prefix + 'gir : "Sesli kanalýnýza girer."', prefix + 'çýk : "Sesli kanalýnýzdan çýkar."',    prefix + 'ekle : "Yazdýðýnýz Youtube linkini sýraya ekler."', prefix + 'sýra : "Sunucudaki müzik sýrasýný gösterir."', prefix + 'çal : "Sýradaki þarkýlarý çalar."', '', 'diðer komutlar:'.toUpperCase(), prefix + 'durdur : "Çalan þarkýyý durdurur."',    prefix + 'devam : "Durdurulan þarkýyý devam ettirir."', prefix + 'geç : "Çalýnan þarkýyý sýradaki þarkýya geçer."', prefix + 'bilgi : "Çalan þarký hakkýnda bilgiler verir."',    prefix + 'ses+(+++) : "Þarký sesini yükseltir."',    prefix + 'ses-(---) : "Þarký sesini azaltýr."',    '`` `'];
        msg.channel.send(tosend.join('\n'));
    },
(düzenlendi)
    'müzikler': (msg) => {
      msg.channel.send(`d Müzik çalýnan sunucu sayýsý: **${client.voiceConnections.size}**`)
    },
    'davet': (msg) => {
        const embed = new Discord.RichEmbed()
            .setDescription(`Davet linkim için [üzerime týkla.](https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&permissions=2146958527&scope=bot)`)
        msg.channel.send(embed);    
  }
};

client.on('message', msg => {
    if (!msg.content.startsWith(prefix)) return;
    if (commands.hasOwnProperty(msg.content.toLowerCase().slice(prefix.length).split(' ')[0])) commands[msg.content.toLowerCase().slice(prefix.length).split(' ')[0]](msg);
});