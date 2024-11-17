document.addEventListener('DOMContentLoaded', function () {
    const voiceControlButton = document.getElementById('voiceControlButton');
    const statusDisplay = document.getElementById('status');
    const spokenCommandDisplay = document.getElementById('spokenCommand');

    // Controle por voz
    voiceControlButton.addEventListener('click', function () {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'pt-BR';

        recognition.onstart = function () {
            statusDisplay.textContent = 'Escutando...';
        };

        recognition.onresult = function (event) {
            const command = event.results[0][0].transcript.toLowerCase();
            console.log('Comando de voz captado:', command);
            spokenCommandDisplay.textContent = 'Você disse: ' + command;

            // Variável para definir o estado de power
            let power = '';  // Será 'on' ou 'off' dependendo do comando
            if (command.includes('acender') || command.includes('ligar')) {
                power = 'on';  // Ligar a luz
            } else if (command.includes('apagar') || command.includes('desligar')) {
                power = 'off';  // Desligar a luz
            }

            // Se 'power' for válido, buscar o local e executar o comando
            if (power) {
                const location = extractLocation(command);
                if (location) {
                    toggleLight(location, power);  // Enviar o comando de ligar ou desligar
                } else {
                    statusDisplay.textContent = 'Comando não reconhecido. Não encontrei o local mencionado.';
                }
            } else {
                statusDisplay.textContent = 'Comando não reconhecido. Tente "acender", "apagar", "ligar", ou "desligar".';
            }
        };

        recognition.onend = function () {
            statusDisplay.textContent = 'Pronto para ouvir...';
        };

        recognition.onerror = function (event) {
            console.error('Erro no reconhecimento de voz:', event.error);
            statusDisplay.textContent = 'Erro ao ouvir: ' + event.error;
        };

        recognition.start();
    });

    // Função para extrair o nome do local do comando
    function extractLocation(command) {
        const locations = ['quarto', 'sala', 'banheiro', 'cozinha'];
        for (let loc of locations) {
            if (command.includes(loc)) {
                return loc;
            }
        }
        return null;  // Se não encontrar nenhum local, retorna null
    }

    // Função para alternar o estado da luz (ligar/desligar)
    function toggleLight(location, power) {
        sendRequest('/set-power', { power: power, location: location });
    }

    // Função para enviar requisição para o servidor
    function sendRequest(path, data) {
        fetch(path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Resposta do servidor:', data.status);
        })
        .catch((error) => {
            console.error('Erro:', error);
        });
    }
});
