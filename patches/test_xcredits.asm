freecode $ff
dl $ffffff

test_hijack:
  PHX
  PHP

  LDA $6070
  AND #$40
  BEQ exit
  LDA #$1A
  STA $0118

exit:
  PLP
  PLX

  LDA #$10 
  STA $0B83
  JML $01C0DE