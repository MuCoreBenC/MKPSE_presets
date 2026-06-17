; XY Calibration Path Template (Precise/Rough)
; Each calibration line uses this pattern
; Placeholders: {{X_OFFSET}}, {{Y_OFFSET}}, {{Z_OFFSET}}
; Line direction: Y-axis lines draw from left to right
; X-axis lines draw from bottom to top
; The loop generates 11 lines per axis with offset accumulation
; Precise: step 0.2mm, range -1.0 to +1.0
; Rough: step 0.5mm, range -2.5 to +2.5
; Line spacing: 4mm between adjacent lines
