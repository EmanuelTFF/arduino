document.addEventListener('DOMContentLoaded', function () {
    // Elementos dos botões
    const powerButtonQuarto = document.getElementById('powerButtonQuarto');
    const powerButtonSala = document.getElementById('powerButtonSala');
    const powerButtonBanheiro = document.getElementById('powerButtonBanheiro');
    const powerButtonCozinha = document.getElementById('powerButtonCozinha');

    // Estado dos LEDs
    let ledState = {
        quarto: false,
        sala: false,
        banheiro: false,
        cozinha: false
    };

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

    // Função para alternar o estado da luz
    function toggleLight(location) {
        // Alterna o estado da luz (liga ou desliga)
        ledState[location] = !ledState[location];

        const power = ledState[location] ? 'on' : 'off';

        // Envia o comando para o servidor
        sendRequest('/set-power', { power: power, location: location })
            .then(() => updateButtonText(location));
    }

    // Função para atualizar o texto do botão
    function updateButtonText(location) {
        const button = document.getElementById(`powerButton${capitalizeFirstLetter(location)}`);
        if (button) {
            button.textContent = ledState[location] ? `Desligar LED ${capitalizeFirstLetter(location)}` : `Ligar LED ${capitalizeFirstLetter(location)}`;
        }
    }

    // Função para capitalizar a primeira letra de uma string
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Adicionar eventos aos botões
    powerButtonQuarto.addEventListener('click', function () { toggleLight('quarto'); });
    powerButtonSala.addEventListener('click', function () { toggleLight('sala'); });
    powerButtonBanheiro.addEventListener('click', function () { toggleLight('banheiro'); });
    powerButtonCozinha.addEventListener('click', function () { toggleLight('cozinha'); });
});
