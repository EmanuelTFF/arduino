// Função para formatar o tempo (adicionar zero à esquerda, se necessário)
function formatTime(unit) {
    return unit < 10 ? '0' + unit : unit;
}

// Função para atualizar o horário na página
function updateClock() {
    const now = new Date();
    const hours = formatTime(now.getHours());
    const minutes = formatTime(now.getMinutes());

    const timeString = `${hours}:${minutes}`;
    
    // Atualiza o conteúdo do div com a id 'currentTime'
    document.getElementById('currentTime').textContent = timeString;
}

// Chama a função de atualizar a cada minuto (60000 ms) para evitar processamento desnecessário
setInterval(updateClock, 60000);

// Inicializa a hora imediatamente ao carregar a página
updateClock();

// Função para mostrar a hora e a saudação dependendo do horário
function updateTimeOfDay() {
    const currentHour = new Date().getHours();
    const timeDisplay = document.getElementById('timeOfDay');
    const currentTime = document.getElementById('currentTime');
    
    // Exibir hora formatada (sem segundos)
    const hours = formatTime(new Date().getHours());
    const minutes = formatTime(new Date().getMinutes());
    currentTime.textContent = `${hours}:${minutes}`;

    // Exibir saudação com base no horário
    if (currentHour >= 6 && currentHour < 12) {
        timeDisplay.innerHTML = `<img src="dia-icon.png" alt="Dia"> Bom dia!`;
    } else if (currentHour >= 12 && currentHour < 18) {
        timeDisplay.innerHTML = `<img src="dia-icon.png" alt="Dia"> Boa tarde!`;
    } else {
        timeDisplay.innerHTML = `<img src="noite-icon.png" alt="Noite"> Boa noite!`;
    }
}

// Atualiza hora e saudação a cada minuto (60000 ms)
setInterval(updateTimeOfDay, 60000);

// Inicializa a hora e saudação quando o site for carregado
updateTimeOfDay();


// Função para obter a temperatura do servidor (do DHT22)
function getTemperature() {
    fetch('/get-temperature')
        .then(response => response.json())
        .then(data => {
            const temperatureDisplay = document.getElementById('temperatureDisplay');
            temperatureDisplay.innerHTML = `${data.temperature}°C`;
        })
        .catch(error => console.error('Erro ao obter a temperatura:', error));
}

// Atualiza hora e temperatura a cada 60 segundos
setInterval(() => {
    updateTimeOfDay();
    getTemperature();
}, 60000);

// Inicializa a hora e a temperatura quando o site for carregado
updateTimeOfDay();
getTemperature();
