const audioElement = new Audio('musica-relaxante.mp3');
const playPauseButton = document.getElementById('playPauseMusic');
const volumeControl = document.getElementById('volumeControl');

// Alterna entre play e pause
playPauseButton.addEventListener('click', () => {
    if (audioElement.paused) {
        audioElement.play();
        playPauseButton.innerText = 'Parar Música';
    } else {
        audioElement.pause();
        playPauseButton.innerText = 'Tocar Música';
    }
});

// Controle de volume
volumeControl.addEventListener('input', (event) => {
    const volume = event.target.value / 100;
    audioElement.volume = volume;
});

// Função para acalmar (reduzir luz e tocar música relaxante)
document.getElementById('calmButton').addEventListener('click', () => {
    // Diminuir intensidade das luzes
    sendRequest('/set-intensity', { location: 'quarto', intensity: 50 }); // Apenas um exemplo, ajustar conforme necessário
    sendRequest('/set-intensity', { location: 'sala', intensity: 50 });

    // Tocar música relaxante
    audioElement.play();

    // Enviar notificação para os pais
    fetch('/send-notification', { method: 'POST' })
        .then(response => response.json())
        .then(data => console.log('Notificação enviada', data))
        .catch(error => console.error('Erro ao enviar notificação', error));
});
