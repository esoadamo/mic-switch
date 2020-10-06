const WebSocket = require('ws');
const path = require('path');
const express = require('express');
const proc = require('child_process');


const app = express();
const wss = new WebSocket.Server({port: 8666});

const WSSs = [];
let isOn = true;
let notification = null;

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
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
                proc.exec('amixer set Capture cap');
                break;
            case 'off':
                proc.exec('amixer set Capture nocap');
                break;
            case 'sync':
                ws.send(isOn ? 'on' : 'off');
                break;
        }
    })
})

async function notificationToggle() {
    if (notification != null && !isOn) {
        notification.kill(9);
        notification = null;
    } else if (notification === null && isOn) {
        notification = proc.spawn('java', ['-jar', path.resolve(__dirname, 'notiflow.jar'), 'Mic']);
    }
}

setInterval(() => {
    proc.exec('amixer get Capture | fgrep [off]', ((error, stdout) => {
        const now = !stdout.length;
        if (now !== isOn) {
            isOn = now;
            notificationToggle().then();
            WSSs.forEach(ws => ws.send(now ? 'on' : 'off'));
        }
    }));
}, 200);
