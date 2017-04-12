/*
 * Listens for commands over the USB Serial interface.
 * Responds for commands to fire the nerf weapon.
 */
 
String cmd;

void setup()
{
  Serial.begin(115200);

  // Initialize the built-in led as outpout
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop()
{
  // listen for serial input commands
  while (Serial.available()) {
    cmd = Serial.readString(); // read the incoming data as string
    if (cmd == "fire") fireMissiles();
  }
}

void fireMissiles() {
  // TODO: Replace with actual digital command to gun
  Serial.println("firing missiles");
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
}

