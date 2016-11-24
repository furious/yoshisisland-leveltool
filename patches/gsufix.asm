lorom
;
; Author: ArneTheGreat
; Description: Code Patch to fix custom sprite data to be run on a SuperUFO flashcart
; This patch uploads a modified GSU routine into SRAM ($707E80) and runs it from SRAM
; It uploads the sprite data into SRAM ($707800) on level load so the GSU can access it
;

freecode $ff
dl $ffffff

spr_data_hijack:
  PHY
  PHX

  STA $02
  LDA $702600
  STA $00
  LDY #$0000
upload_loop_spr_data:
  LDA [$00],y
  CMP #$FFFF
  BEQ end_marker
  TYX
  STA $707800,x
  INY
  LDA [$00],y
  TYX
  STA $707800,x
  INY
  INY
  BRA upload_loop_spr_data
end_marker:
  TYX
  STA $707800,x
  LDA #$0070
  STA $702602
  LDA #$7800
  STA $702600

.return
  PLX
  PLY
  RTL
  ;JML $01B0AD

print pc
upload_gsu_routine:
  PHA
  PHX
  PHP
; $83 bytes from $098000 to $707E80
  REP #$30
  PHB
  LDA #$0083
  LDX #$8000
  LDY #$7E80
  MVN $0970
  PLB

.return
  PLP
  PLX
  PLA

  REP #$20
  LDY #$00
  JML $0082D8

arch superfx

org $098000

; r1 = camera x + offset (288 right or 48 left)
; r2 = camera y - 32
; r3 = camera y + offset (272 down or 32 up)
; r4 = camera x - 48
  cache
  from r1
  asr
  asr
  asr
  to r1
  asr
  from r2
  asr
  asr
  asr
  to r2
  asr
  from r3
  asr
  asr
  asr
  to r3
  asr
  from r4
  asr
  asr
  asr
  to r4
  asr
  ibt   r5,#$FFFF
  iwt   r6,#$01FF

; swap r7 (constant reg) with r14
  ibt   r14,#$0016
  ibt   r13,#$0014
  ibt   r8,#$0000
  iwt   r9,#$28CA
  iwt   r10,#$27CE

; rom bank pointless now
  ; lm    r0,($2602)
  ; romb

; swap r7 (constant reg) with r14
  lm    r7,($2600)

; loop begins here
CODE_098034:
  ldb   (r9)
  dec   r0

; ldb instead of getb
  bmi CODE_098041
  to r12

  with r7
  add   #3
  inc   r8
  bra CODE_098034
  inc   r9

CODE_098041:
; ldb wizardry instead of getbh
  ldb   (r7)
  inc r7

  ldb   (r7)
  swap
  to r12
  or r12

  from r12
  sub   r5
  beq CODE_098080
  inc   r7
  from r12
  and   r6
  stw   (r10)
  to r11

; ldb instead of getb
  ldb   (r7)

  inc   r7
  from r12
  hib
  lsr
  move  r12,r0
  sub   r3
  bne CODE_098060
  from r11
  sub   r4
  bmi CODE_09805F
  sub   r14
  bmi CODE_09806B

CODE_09805F:
  from r11

CODE_098060:
  sub   r1
  bne CODE_09807C
  from r12
  sub   r2
  bmi CODE_09807C
  sub   r13
  bpl CODE_09807C
  nop

CODE_09806B:
  inc   r10
  inc   r10
  from r11
  stw   (r10)
  inc   r10
  inc   r10
  from r12
  stw   (r10)
  inc   r10
  inc   r10
  from r8
  stw   (r10)
  inc   r10
  inc   r10
  from r5
  stb   (r9)

CODE_09807C:
  inc   r8
  bra CODE_098034

  inc   r9

CODE_098080:
  from r5
  stw   (r10)
  stop
  nop