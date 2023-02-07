import * as aaa from './index.js';

const chat = new aaa.Chat();

chat.events.on('msgSent', (data) => {
	chat.print(`<${data.sender ?? 'unknown'}>: ${data.msg}`);
});

chat.events.on('msgReceived', (data) => {
	chat.print(`<${data.sender ?? 'unknown'}>: ${data.msg}`);
});

chat.events.emit('msgReceived', { msg: 'Your mom is gay', sender: 'The voices in your head' });
