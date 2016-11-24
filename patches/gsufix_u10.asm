lorom
;
; Author: ArneTheGreat
; Hijack for USA ROM, version 1.0 
;

; replace GSU call with SRAM call
org $0395C4
  LDX #$70
  LDA #$7E80

; upload new GSU routine
org $0082D4
  autoclean jml upload_gsu_routine

; Upload sprite data to SRAM (on level load)
org $01B0A9
  autoclean jsl spr_data_hijack

; Upload sprite data to SRAM (on intro cutscene load)
org $10DA86
  autoclean jsl spr_data_hijack

incsrc "gsufix.asm"
