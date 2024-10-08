const express = require('express');
const { SerialPort } = require('serialport');  // Biblioteca serialport
const app = express();
const port = 3000;

// Configura a porta serial para o Arduino
const arduinoPort = new SerialPort({
    path: 'COM3',   // Substitua pela porta correta
    baudRate: 9600
});

app.use(express.json());
app.use(express.static('public')); // Serve os arquivos estáticos como o HTML

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

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
