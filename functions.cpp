#include "main.h"
#define sprintf(format, ...) AnsiString().sprintf((format), __VA_ARGS__)

// OTHER FUNCTIONS
void fn_Log(UnicodeString text){
	if(frsMain->chk_DebugInfo->Checked)
		frsMain->DebugInfo->Lines->Add(text);
}

// SNES ADDRESSING FUNCTIONS
int addr2pc(int addr){
	if(addr >= 0x400000)
		return addr - 0x400000;

	int bank = (addr & 0xFF0000) >> 16;
	int absolute = (addr & 0x00FFFF);
	int abs_corrected = absolute - 0x8000 * (1 - bank % 2);

	return (bank << 15) | abs_corrected;
	//return ((addr & 0xff0000) >> 1) | (addr & 0x7FFF);
}
int addr2snes(int addr){
	int bank = (addr & 0xFF0000) * 2 + (addr & 0x008000) * 2;
	int absolute = addr & 0x00FFFF;
	int abs_corrected = absolute + 0x008000 - (absolute & 0x008000);
	return bank | abs_corrected;
}
int dickbutt2snes(int addr){
	return addr2snes(addr2pc(addr));
}
bool checkcrossbank(int addr, int size){
	//fn_Log(addr2snes(addr + size) - addr2snes(addr));
	return (addr2snes(addr) & 0xFF0000) >> 16 != (addr2snes(addr + size) & 0xFF0000) >> 16;
}

// ADDRESS FUNCTIONS
unsigned short u8(char *value){
	return *(((unsigned short*) value));
}
unsigned short u16(char *value){
	return *(((unsigned short*) value));
}
unsigned int u24(char *value){
	return *(((unsigned int*) value)) & 0xffffff;
}
unsigned int u32(char *value){
	return *(((unsigned int*) value));
}
char * int2bytes(unsigned int value, int size){
	char * bytes = new char[size];
	for(int x = 0; x < size; x++)
		bytes[x] = (value >> (x * 8));
	return bytes;
}

