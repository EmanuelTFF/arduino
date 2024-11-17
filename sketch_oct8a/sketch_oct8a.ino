#include <Wire.h>          // Biblioteca I2C
#include <U8glib.h>        // Biblioteca U8glib para displays

// Pino de conexão do display (Uso do I2C no caso do SSD1306)
U8GLIB_SSD1306_128X64 u8g;  // Para I2C, você usa 2 parâmetros (não é necessário especificar pinos SDA/SCL)

int ledPinQuarto = 3;    // Pino do LED do quarto
int ledPinSala = 5;       // Pino do LED da sala
int ledPinBanheiro = 6;   // Pino do LED do banheiro
int ledPinCozinha = 9;    // Pino do LED da cozinha

// Variáveis de controle de estado
bool ledOnQuarto = false;
bool ledOnSala = false;
bool ledOnBanheiro = false;
bool ledOnCozinha = false;

String lembrete = "";  // Variável para armazenar o lembrete
unsigned long lembreteTime = 0;  // Tempo para exibir lembrete por um período
const unsigned long tempoExibicao = 5000; // Exibe o lembrete por 5 segundos
const int maxLineLength = 16; // Máximo de caracteres por linha (ajuste conforme necessário)

void setup() {
  Serial.begin(9600);
  pinMode(ledPinQuarto, OUTPUT);
  pinMode(ledPinSala, OUTPUT);
  pinMode(ledPinBanheiro, OUTPUT);
  pinMode(ledPinCozinha, OUTPUT);

  // Inicia todos os LEDs desligados
  digitalWrite(ledPinQuarto, LOW);
  digitalWrite(ledPinSala, LOW);
  digitalWrite(ledPinBanheiro, LOW);
  digitalWrite(ledPinCozinha, LOW);

  // Define a cor do texto (branco) e o fundo (preto) é o comportamento padrão
  u8g.setColorIndex(1);   // Cor do texto (1 = branco)

  // Defina a fonte (pode ser alterada para qualquer fonte disponível)
  u8g.setFont(u8g_font_6x10);  // Fonte 6x10 (ajuste conforme necessário)
}

void loop() {
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');  // Lê a string enviada

    // Se o comando for um lembrete, exibe no display com "LEMBRETE:" na frente
    if (command.startsWith("LEMBRETE:")) {
      lembrete = "LEMBRETE: " + command.substring(9);  // Adiciona "LEMBRETE:" no início
      
      // Converte todo o texto para maiúsculas
      lembrete.toUpperCase();

      lembreteTime = millis();  // Armazena o tempo de início da exibição do lembrete
    }

    // Comandos para ligar/desligar LEDs...
    if (command.startsWith("ON")) {
      if (command == "ON_quarto") {
        ledOnQuarto = true;
        analogWrite(ledPinQuarto, 128);  // Intensidade média
      } else if (command == "ON_sala") {
        ledOnSala = true;
        analogWrite(ledPinSala, 128);
      } else if (command == "ON_banheiro") {
        ledOnBanheiro = true;
        analogWrite(ledPinBanheiro, 128);
      } else if (command == "ON_cozinha") {
        ledOnCozinha = true;
        analogWrite(ledPinCozinha, 128);
      }
    } 
    else if (command.startsWith("OFF")) {
      if (command == "OFF_quarto") {
        ledOnQuarto = false;
        analogWrite(ledPinQuarto, 0);
      } else if (command == "OFF_sala") {
        ledOnSala = false;
        analogWrite(ledPinSala, 0);
      } else if (command == "OFF_banheiro") {
        ledOnBanheiro = false;
        analogWrite(ledPinBanheiro, 0);
      } else if (command == "OFF_cozinha") {
        ledOnCozinha = false;
        analogWrite(ledPinCozinha, 0);
      }
    } 
    else {
      // Comando para ajustar intensidade...
    }
  }

  // Exibe o lembrete se estiver disponível e por tempo determinado
  if (lembrete != "" && (millis() - lembreteTime) < tempoExibicao) {
    u8g.firstPage();
    do {
      // Divide o lembrete em várias linhas para evitar que ele ultrapasse o display
      String linha1 = lembrete.substring(0, maxLineLength);
      String linha2 = lembrete.substring(maxLineLength, 2 * maxLineLength);
      String linha3 = lembrete.substring(2 * maxLineLength, 3 * maxLineLength);
      
      // Exibe o texto nas linhas
      u8g.drawStr(0, 20, linha1.c_str());
      u8g.drawStr(0, 30, linha2.c_str());
      u8g.drawStr(0, 40, linha3.c_str());
      
    } while (u8g.nextPage());
  }
}
