int ledPin = 3;  // Pino digital para o LED
bool ledOn = false;

void setup() {
  Serial.begin(9600);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);  // Inicia com o LED desligado
}

void loop() {
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');  // Lê a string enviada

    if (command == "ON") {
      ledOn = true;
      analogWrite(ledPin, 128);  // Liga o LED com intensidade média
    } else if (command == "OFF") {
      ledOn = false;
      analogWrite(ledPin, 0);    // Desliga o LED
    } else {
      // Trata o comando de intensidade (espera um valor entre 0 e 255)
      int intensity = command.toInt();
      if (ledOn && intensity >= 0 && intensity <= 255) {
        analogWrite(ledPin, intensity);
      }
    }
  }
}
