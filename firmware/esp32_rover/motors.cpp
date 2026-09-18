#include "motors.h"

static MotorState current_state = MOTOR_STOPPED;
static uint8_t current_speed = DEFAULT_SPEED;

void initMotors() {
    // 1. Set all enable and PWM pins as OUTPUT
    pinMode(PIN_M1_RPWM, OUTPUT);
    pinMode(PIN_M1_LPWM, OUTPUT);
    pinMode(PIN_M1_R_EN, OUTPUT);
    pinMode(PIN_M1_L_EN, OUTPUT);

    pinMode(PIN_M2_RPWM, OUTPUT);
    pinMode(PIN_M2_LPWM, OUTPUT);
    pinMode(PIN_M2_R_EN, OUTPUT);
    pinMode(PIN_M2_L_EN, OUTPUT);

    // 2. CRITICAL SAFETY: Guarantee motors are completely stopped on boot
    stopMotors();
}

void stopMotors() {
    // Disable driver outputs
    digitalWrite(PIN_M1_R_EN, LOW);
    digitalWrite(PIN_M1_L_EN, LOW);
    digitalWrite(PIN_M2_R_EN, LOW);
    digitalWrite(PIN_M2_L_EN, LOW);

    // Set PWM channels to zero
    analogWrite(PIN_M1_RPWM, 0);
    analogWrite(PIN_M1_LPWM, 0);
    analogWrite(PIN_M2_RPWM, 0);
    analogWrite(PIN_M2_LPWM, 0);

    current_state = MOTOR_STOPPED;
}

void moveForward(uint8_t speed) {
    current_speed = speed;
    
    // Enable both motor drivers
    digitalWrite(PIN_M1_R_EN, HIGH);
    digitalWrite(PIN_M1_L_EN, HIGH);
    digitalWrite(PIN_M2_R_EN, HIGH);
    digitalWrite(PIN_M2_L_EN, HIGH);

    // Left Forward (RPWM speed, LPWM 0), Right Forward (RPWM speed, LPWM 0)
    analogWrite(PIN_M1_LPWM, 0);
    analogWrite(PIN_M2_LPWM, 0);
    analogWrite(PIN_M1_RPWM, speed);
    analogWrite(PIN_M2_RPWM, speed);

    current_state = MOTOR_FORWARD;
}

void moveBackward(uint8_t speed) {
    current_speed = speed;

    // Enable both motor drivers
    digitalWrite(PIN_M1_R_EN, HIGH);
    digitalWrite(PIN_M1_L_EN, HIGH);
    digitalWrite(PIN_M2_R_EN, HIGH);
    digitalWrite(PIN_M2_L_EN, HIGH);

    // Left Reverse (LPWM speed, RPWM 0), Right Reverse (LPWM speed, RPWM 0)
    analogWrite(PIN_M1_RPWM, 0);
    analogWrite(PIN_M2_RPWM, 0);
    analogWrite(PIN_M1_LPWM, speed);
    analogWrite(PIN_M2_LPWM, speed);

    current_state = MOTOR_BACKWARD;
}

void turnLeft(uint8_t speed) {
    current_speed = speed;

    // Enable both motor drivers
    digitalWrite(PIN_M1_R_EN, HIGH);
    digitalWrite(PIN_M1_L_EN, HIGH);
    digitalWrite(PIN_M2_R_EN, HIGH);
    digitalWrite(PIN_M2_L_EN, HIGH);

    // Left Reverse, Right Forward (Skid steer pivot left)
    analogWrite(PIN_M1_RPWM, 0);
    analogWrite(PIN_M2_LPWM, 0);
    analogWrite(PIN_M1_LPWM, speed);
    analogWrite(PIN_M2_RPWM, speed);

    current_state = MOTOR_LEFT;
}

void turnRight(uint8_t speed) {
    current_speed = speed;

    // Enable both motor drivers
    digitalWrite(PIN_M1_R_EN, HIGH);
    digitalWrite(PIN_M1_L_EN, HIGH);
    digitalWrite(PIN_M2_R_EN, HIGH);
    digitalWrite(PIN_M2_L_EN, HIGH);

    // Left Forward, Right Reverse (Skid steer pivot right)
    analogWrite(PIN_M1_LPWM, 0);
    analogWrite(PIN_M2_RPWM, 0);
    analogWrite(PIN_M1_RPWM, speed);
    analogWrite(PIN_M2_LPWM, speed);

    current_state = MOTOR_RIGHT;
}

void setMotorSpeed(uint8_t speed) {
    current_speed = speed;
    switch (current_state) {
        case MOTOR_FORWARD:  moveForward(speed); break;
        case MOTOR_BACKWARD: moveBackward(speed); break;
        case MOTOR_LEFT:     turnLeft(speed); break;
        case MOTOR_RIGHT:    turnRight(speed); break;
        default:             stopMotors(); break;
    }
}

const char* getMotorStateString() {
    switch (current_state) {
        case MOTOR_FORWARD:  return "FORWARD";
        case MOTOR_BACKWARD: return "BACKWARD";
        case MOTOR_LEFT:     return "LEFT";
        case MOTOR_RIGHT:    return "RIGHT";
        default:             return "STOPPED";
    }
}
