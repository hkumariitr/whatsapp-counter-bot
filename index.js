const express = require('express');
const eapp = express();
const port = process.env.PORT || 3000;

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

// 🔹 Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDx1U-dT76TWYbP7811TDDqtsOlQ9jfP1o",
  authDomain: "whatsapp-bot-pp.firebaseapp.com",
  projectId: "whatsapp-bot-pp",
  storageBucket: "whatsapp-bot-pp.firebasestorage.app",
  messagingSenderId: "653572301839",
  appId: "1:653572301839:web:bcbec3d45a2b0f5bd02f7a",
  measurementId: "G-Y27WKNWR2T"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 Setup WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth()
});

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp bot is ready!');
});

client.on('message_create', async (message) => {
    // const sender = message.key.remoteJid;
  // message_create event fires for BOTH incoming and outgoing messages
  const isFromMe = message.fromMe;
  const text = message.body.toLowerCase().trim();

//   console.log(message.id)
//   console.log(`💬 [${isFromMe ? 'You' : 'Other'}] ${message.from} → ${text}`);

  try {
    // 🔹 Handle "increment" — from you or anyone
    if (text === 'increment') {
      const counterRef = doc(db, 'counter', 'global');
      const snapshot = await getDoc(counterRef);
      let count = snapshot.exists() ? snapshot.data().value : 0;
      count++;
      await setDoc(counterRef, { value: count });

      // If message is from someone else → reply to them
      if (!isFromMe) {
        await message.reply(`📈 Counter: ${count}`);
      } else {
        // If you sent "increment" to someone else → send message in that chat
        await message.getChat().then(chat => chat.sendMessage(`📈 Counter (updated): ${count}`));
      }
      return;
    }

    // 🔹 "show counter"
    if (text === 'show counter') {
      const counterRef = doc(db, 'counter', 'global');
      const snapshot = await getDoc(counterRef);
      const count = snapshot.exists() ? snapshot.data().value : 0;
      if (!isFromMe) {
        await message.reply(`📊 Current counter: ${count}`);
      } else {
        await message.getChat().then(chat => chat.sendMessage(`📊 Current counter: ${count}`));
      }
      return;
    }

    // 🔹 Auto-replies (for messages TO YOU only)
    if (!isFromMe) {
        
      if ( message.id.remote == "919334016140@c.us" &&text.includes('morning')) {
        await message.reply('🌞 Good morning! ☕✨ Mr Harshit is angry with you and might not reply, so i am wishing on his behalf');
        return;
      }
      if (text.includes('good night')) {
        await message.reply('🌙 Good night! Sleep well and recharge 💫');
        return;
      }
    }

  } catch (err) {
    console.error(err);
    if (!isFromMe) {
      await message.reply('⚠️ Error connecting to database. Try again later.');
    }
  }
});


client.initialize();
// "919334016140@c.us";

eapp.get('/', (req, res) => {
    res.send('WhatsApp bot is running successfully!');
});

eapp.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});