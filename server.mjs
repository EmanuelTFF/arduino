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

app.post('/set-power', (req, res) => {
    const { power, location } = req.body;

    let command = '';
    if (location === 'quarto') {
        command = power === 'on' ? 'ON_quarto' : 'OFF_quarto';
    } else if (location === 'sala') {
        command = power === 'on' ? 'ON_sala' : 'OFF_sala';
    } else if (location === 'banheiro') {
        command = power === 'on' ? 'ON_banheiro' : 'OFF_banheiro';
    } else if (location === 'cozinha') {
        command = power === 'on' ? 'ON_cozinha' : 'OFF_cozinha';
    }

    console.log('Comando enviado para o Arduino:', command);  // Adicione este log

    arduinoPort.write(command + '\n', (err) => {
        if (err) {
            return res.status(500).json({ status: 'Erro ao enviar o comando para o Arduino' });
        }
        res.json({ status: `${location.charAt(0).toUpperCase() + location.slice(1)} LED ${power === 'on' ? 'ligado' : 'desligado'}` });
    });
});

// Rota para ajustar a intensidade de um LED específico
app.post('/set-intensity', (req, res) => {
    const { intensity, location } = req.body;

    let command = '';
    if (location === 'quarto') {
        command = `INTENSITY_quarto ${intensity}`;
    } else if (location === 'sala') {
        command = `INTENSITY_sala ${intensity}`;
    } else if (location === 'banheiro') {
        command = `INTENSITY_banheiro ${intensity}`;
    } else if (location === 'cozinha') {
        command = `INTENSITY_cozinha ${intensity}`;
    }

    console.log(`Comando de intensidade enviado para o Arduino: ${command}`);  // Log para depuração

    arduinoPort.write(command + '\n', (err) => {
        if (err) {
            return res.status(500).json({ status: 'Erro ao enviar o valor de intensidade para o Arduino' });
        }
        res.json({ status: `Intensidade do LED ${location} ajustada para ${intensity}` });
    });
});



// Adicionando rota para obter temperatura
app.get('/get-temperature', (req, res) => {
    // Aqui, você integraria o código para ler o sensor DHT22 e obter a temperatura
    // Este é apenas um exemplo de resposta:
    const temperature = 25; // Exemplo estático
    res.json({ temperature });
});


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
    sendNotification('Registro de Saída', 'Seu filho está se acalmando.')
        .then(data => res.json({ success: true, data }))
        .catch(error => {
            console.error('Erro ao enviar notificação:', error);
            res.status(500).json({ success: false, error: error.message });
        });
});


app.post('/send-reminder', (req, res) => {
    const { reminder } = req.body;  // Recebe o lembrete do corpo da requisição

    if (!reminder) {
        return res.status(400).json({ error: 'Lembrete não especificado.' });
    }

    const command = `LEMBRETE:${reminder}`;  // Formata o comando

    // Envia o comando via serial
    arduinoPort.write(command + '\n', (err) => {
        if (err) {
            return res.status(500).json({ status: 'Erro ao enviar o lembrete para o Arduino' });
        }
        res.json({ status: `Lembrete enviado: ${reminder}` });
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
