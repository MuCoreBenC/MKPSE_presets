; LShape Repetition Calibration Path Template
; Placeholders: {{X_OFFSET}}, {{Y_OFFSET}}, {{Z_OFFSET}}, {{BASE_X}}, {{BASE_Y}}
; The L-shape is a staircase pattern for testing repeatability
; Segment length: 10mm per step
; Coordinates are relative to BASE_X, BASE_Y
G1 X{{BASE_X}} Y{{BASE_Y}}
G1 X{{BASE_X}} Y{{BASE_Y_PLUS_30}}
G1 X{{BASE_X_PLUS_10}} Y{{BASE_Y_PLUS_30}}
G1 X{{BASE_X_PLUS_10}} Y{{BASE_Y_PLUS_20}}
G1 X{{BASE_X_PLUS_20}} Y{{BASE_Y_PLUS_20}}
G1 X{{BASE_X_PLUS_20}} Y{{BASE_Y_PLUS_10}}
G1 X{{BASE_X_PLUS_30}} Y{{BASE_Y_PLUS_10}}
G1 X{{BASE_X_PLUS_30}} Y{{BASE_Y}}
