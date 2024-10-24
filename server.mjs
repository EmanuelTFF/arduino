import express from 'express';
import { SerialPort } from 'serialport';
import fetch from 'node-fetch';

const app = express();
const port = 3000;

// Configura a porta serial para o Arduino
const arduinoPort = new SerialPort({
    path: 'COM3',   // Substitua pela porta correta
    baudRate: 9600
});

// Token do Pushbullet
const pushbulletToken = 'o.FWA7AghxFpx3o4d91rU7t4bpqx5o4CrT';

app.use(express.json());
app.use(express.static('public')); // Serve os arquivos estáticos como o HTML

// Função para enviar notificação
function sendNotification(title, body) {
    const url = 'https://api.pushbullet.com/v2/pushes';
    const options = {
        method: 'POST',
        headers: {
            'Access-Token': pushbulletToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'note', title, body }),
    };

    return fetch(url, options).then(response => response.json());
}

// Rota para ligar/desligar o LED
app.post('/set-power', (req, res) => {
    const power = req.body.power;

    // Envia o comando para o Arduino
    if (power === 'on') {
        arduinoPort.write('ON\n', (err) => {
            if (err) {
                return res.status(500).json({ status: 'Erro ao enviar o comando ON para o Arduino' });
            }
            res.json({ status: 'LED ligado' });
        });
    } else if (power === 'off') {
        arduinoPort.write('OFF\n', (err) => {
            if (err) {
                return res.status(500).json({ status: 'Erro ao enviar o comando OFF para o Arduino' });
            }
            res.json({ status: 'LED desligado' });
        });
    }
});

// Rota para ajustar a intensidade do LED
app.post('/set-intensity', (req, res) => {
    const intensity = req.body.intensity;

    // Envia o valor da intensidade para o Arduino (ex: PWM para controle de intensidade)
    arduinoPort.write(`${intensity}\n`, (err) => {
        if (err) {
            return res.status(500).json({ status: 'Erro ao enviar o valor para o Arduino' });
        }
        res.json({ status: `Intensidade ajustada para ${intensity}` });
    });
});

// Função para monitorar o LDR
function monitorLDR() {
    // Envia um comando para o Arduino para obter o estado do LED
    arduinoPort.write('GET_LED_STATE\n', (err) => {
        if (err) {
            console.error('Erro ao enviar comando para obter o estado do LED:', err);
            return;
        }
    });
}

// Evento para receber dados do Arduino
arduinoPort.on('data', (data) => {
    const response = data.toString().trim();
    console.log('Resposta do Arduino:', response);
    
    // Verifica se a resposta é o estado do LED ou o valor do LDR
    if (response === '1' || response === '0') {
        // Estado do LED: 1 (ligado) ou 0 (desligado)
        arduinoPort.write('READ_LDR\n', (err) => {
            if (err) {
                console.error('Erro ao enviar comando para ler o LDR:', err);
                return;
            }
        });
    } else {
        // Aqui assumimos que a resposta é o valor do LDR
        const ldrValue = parseInt(response, 10);
        const threshold = 300; // Ajuste conforme necessário

        // Verifica se a luz está baixa e o LED está desligado
        if (ldrValue < threshold) {
            arduinoPort.write('GET_LED_STATE\n', (err) => {
                if (err) {
                    console.error('Erro ao verificar estado do LED:', err);
                    return;
                }
            });
        }
    }
});

// Rota para enviar a notificação
app.post('/send-notification', (req, res) => {
    sendNotification('Registro de Saída', 'Seu filho acabou de sair de casa.')
        .then(data => res.json({ success: true, data }))
        .catch(error => {
            console.error('Erro ao enviar notificação:', error);
            res.status(500).json({ success: false, error: error.message });
        });
});

// Inicia a monitoração do LDR a cada 5 segundos
setInterval(monitorLDR, 5000);

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
