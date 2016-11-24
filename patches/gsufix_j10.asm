lorom
;
; Author: ArneTheGreat
; Hijack for Japanese ROM, version 1.0 
;

; replace GSU call with SRAM call
org $0395C4
  LDX #$70
  LDA #$7E80

; upload new GSU routine
org $0082D4
  autoclean jml upload_gsu_routine

; Upload sprite data to SRAM (on level load)
org $01C2DB
  autoclean jsl spr_data_hijack

; Upload sprite data to SRAM (on intro cutscene load)
org $10D9A2
  autoclean jsl spr_data_hijack

incsrc "gsufix.asm"
