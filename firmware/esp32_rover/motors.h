#ifndef MOTORS_H
#define MOTORS_H

#include <Arduino.h>

// ============================================================================
// MINEGUARD MOTOR DRIVER PIN ASSIGNMENTS (BTS7960 / IBT-2 DUAL MODULES)
// ============================================================================
// Driver 1 - Left Side Motors (Front Left + Rear Left)
#define PIN_M1_RPWM    27   // Forward PWM
#define PIN_M1_LPWM    14   // Reverse PWM
#define PIN_M1_R_EN    13   // Forward Enable
#define PIN_M1_L_EN    12   // Reverse Enable (Strapping pin handled safely)

// Driver 2 - Right Side Motors (Front Right + Rear Right)
#define PIN_M2_RPWM    21   // Forward PWM
#define PIN_M2_LPWM    19   // Reverse PWM
#define PIN_M2_R_EN    5    // Forward Enable
#define PIN_M2_L_EN    2    // Reverse Enable

// PWM Settings
#define PWM_FREQ       5000 // 5 kHz PWM frequency
#define PWM_RES        8    // 8-bit resolution (0 - 255)
#define DEFAULT_SPEED  150  // Conservative default PWM speed (approx 58%)

// Motor Status Enum
enum MotorState {
    MOTOR_STOPPED,
    MOTOR_FORWARD,
    MOTOR_BACKWARD,
    MOTOR_LEFT,
    MOTOR_RIGHT
};

// Function Declarations
void initMotors();
void stopMotors();
void moveForward(uint8_t speed = DEFAULT_SPEED);
void moveBackward(uint8_t speed = DEFAULT_SPEED);
void turnLeft(uint8_t speed = DEFAULT_SPEED);
void turnRight(uint8_t speed = DEFAULT_SPEED);
void setMotorSpeed(uint8_t speed);
const char* getMotorStateString();

#endif // MOTORS_H
