const WebSocket = require('ws');
const path = require('path');
const express = require('express');
const { exec } = require('child_process');


const app = express();
const wss = new WebSocket.Server({port: 8666});

const WSSs = [];
let isOn = true;

app.get('/', (req, res) => {
    res.sendFile(path.resolve('index.html'));
})

app.listen(8665, () => {
    console.log(`Example app listening at http://localhost:${8665}`)
});

wss.on('connection', ws => {
    WSSs.push(ws);
    ws.on('message', message => {
        console.log('<', message);
        switch (message) {
            case 'on':
                exec('amixer set Capture cap');
                break;
            case 'off':
                exec('amixer set Capture nocap');
                break;
            case 'sync':
                ws.send(isOn ? 'on' : 'off');
                break;
        }
    })
})

setInterval(() => {
    exec('amixer get Capture | fgrep [off]', ((error, stdout) => {
        const now = !stdout.length;
        if (now !== isOn) {
            isOn = now;
            WSSs.forEach(ws => ws.send(now ? 'on' : 'off'));
        }
    }));
}, 200);
