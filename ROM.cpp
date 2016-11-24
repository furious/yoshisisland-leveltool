#pragma hdrstop

#include "main.h"
#include "ROM.h"
#include "functions.cpp"

#pragma package(smart_init)
/*
--- ROM HEADER
$00FFB0 	2 bytes	Misc. 	ROM registration: Maker code (ASCII): "01" (Nintendo)
$00FFB2 	4 bytes	Misc. 	ROM registration: Game code (ASCII): "YI  "
$00FFB6 	6 bytes	Misc. 	ROM registration: reserved (all $00)
$00FFBC 	1 byte 	Misc. 	ROM registration: Expansion FLASH Size ($00 = none)
$00FFBD 	1 byte 	Misc. 	ROM registration: Super FX RAM size ($05 = 32KB)
$00FFBE 	1 byte 	Misc. 	ROM registration: Special version ($00 = not special)
$00FFBF 	1 byte 	Misc. 	ROM registration: Chipset sub-type ($00)
$00FFC0    21 bytes	Misc. 	ROM header: Cartridge title (ASCII): "YOSHI'S ISLAND       "
$00FFD5 	1 byte 	Misc. 	ROM header: ROM Makeup ($20 = LoROM)
$00FFD6 	1 byte 	Misc. 	ROM header: Chipset ($15 = ROM + SuperFX + RAM + SRAM)
$00FFD7 	1 byte 	Misc. 	ROM header: ROM size ($0B = 2MB)
$00FFD8 	1 byte 	Misc. 	ROM header: SRAM size
$00FFD9 	1 byte 	Misc. 	ROM header: Region ($01 = NTSC)
$00FFDA 	1 byte 	Misc. 	ROM header: $33 (fixed value)
$00FFDB 	1 byte 	Misc. 	ROM header: Version ($00 = 1.0)
$00FFDC 	2 bytes	Misc. 	ROM header: Checksum complement (inverted bits)
$00FFDE 	2 bytes	Misc. 	ROM header: Checksum

*/

// LevelFile Class
__fastcall LevelFile::LevelFile(UnicodeString FileName) : TMemoryStream()
{
	LoadFromFile(FileName);
	FetchLevel();
}

char * __fastcall LevelFile::ReadLevel(unsigned int Address, int Lenght){
	char * Buffer = new char[Lenght];
	Position = Address;
	Read(Buffer, Lenght);
	return Buffer;
}

char __fastcall LevelFile::ReadLevel(unsigned int Address){
	return ReadLevel(Address, 1)[0];
}

void __fastcall LevelFile::FetchLevel(){
	RAWBYTE = ReadLevel(0);
	ID = (unsigned int) RAWBYTE;
	data.header = ReadLevel(1, 10);
	data.total_exits = 0;
	data.total_objects = 0;
	sprites.total = 0;

	// Fetching Objects
	LevelOffset = 11; DataSize = 0;
	while(Position < Size && (RAWBYTE = ReadLevel(LevelOffset + DataSize)) != 0xFF){
		DataSize += (RAWBYTE == 0x00 || (ObjectTable[RAWBYTE] & 0x03) < 0x02) ? 4 : 5;
		data.total_objects++;
	}
	DataSize++;
	data.objects = ReadLevel(LevelOffset, DataSize);
	data.size_objects = DataSize;

	// Fetching Screen Exits
	LevelOffset += DataSize; DataSize = 0;
	while(Position < Size && (RAWBYTE = ReadLevel(LevelOffset + DataSize)) < 0x80){
		DataSize += 5;
		data.total_exits++;
	}
	DataSize++;
	data.exits = ReadLevel(LevelOffset, DataSize);
	data.size_exits = DataSize;
	data.size_total = 10 + data.size_objects + data.size_exits;

	// Fetching Sprites
	LevelOffset += DataSize; DataSize = 0;
	while(Position < Size && u16(ReadLevel(LevelOffset + DataSize, 2)) != 0xFFFF){
		DataSize += 3;
		sprites.total++;
	}
	DataSize+=2;
	sprites.data = ReadLevel(LevelOffset, DataSize);
	sprites.size = DataSize;

	// Fetching Level Main/Midway Entrances (if available)
	/*LevelOffset += DataSize;
	entrances.main = ReadROM(LevelOffset, 3);
	entrances.midway = ReadROM(LevelOffset + 3, 3); */
}

// ROMFile Class
__fastcall ROMFile::ROMFile(UnicodeString FileName) : TMemoryStream(){
	try {
		LoadFromFile(FileName);

		RemoveHeader();

		Title = Trim(ReadROM(0xFFC0, 21));
		GameCode = Trim(ReadROM(0xFFB2, 4));

		Region = RAMSize = ExRAMSize = ROMSize = "Invalid";
		if(ReadROM(0xFFD9) < 10)
			Region =  Regions[ReadROM(0xFFD9)];
		if(ReadROM(0xFFD8) < 7)
			RAMSize = RAMSizes[ReadROM(0xFFD8)];
		if(ReadROM(0xFFBD) < 7)
			ExRAMSize = RAMSizes[ReadROM(0xFFBD)];
		if(ReadROM(0xFFD7) - 9 < 6)
			ROMSize = ROMSizes[ReadROM(0xFFD7) - 0x09];

		Version = sprintf("1.%d", ReadROM(0xFFDB));

		if(CheckROM()){
			LevelOffset = LevelOffsets[ReadROM(0xFFD9)];
			LevelMainEntranceOffset = LevelMainEntranceOffsets[ReadROM(0xFFD9)][0];
			LevelMidwayEntranceOffset = LevelMidwayEntranceOffsets[ReadROM(0xFFD9)][0];

			FreeSpaceBlocks();

			/*for(int x=0; x <= 0x37; x++){
				DataOffset = FetchMainEntrancePointer(x);
				LevelMainEntrances[ReadROM(DataOffset)] = DataOffset+1;
			}

			for(int x=0; x <= 0x79; x++){
				DataOffset = FetchMidwayEntrancePointer(x);
				LevelMidwayEntrances[ReadROM(DataOffset)] = DataOffset+1;
			}      */
		}
	} catch (Exception &e) {
		fn_Log("Exception: " + e.Message);
	}
}

char __fastcall ROMFile::ReadPC(unsigned int Address){
	return ReadROM(Address, 1, true)[0];
}
char * __fastcall ROMFile::ReadPC(unsigned int Address, int Lenght){
	return ReadROM(Address, Lenght, true);
}
char __fastcall ROMFile::ReadROM(unsigned int Address){
	return ReadROM(Address, 1, false)[0];
}
char * __fastcall ROMFile::ReadROM(unsigned int Address, int Lenght, bool PC){
	char * Buffer = new char[Lenght];
	Position = PC ? Address : addr2pc(Address) + (HasHeader ? 0x200 : 0); // Headers are bad, we why people use it
	Read(Buffer, Lenght);
	return Buffer;
}

unsigned int __fastcall ROMFile::WritePC(unsigned int Address, char * Data, int Lenght){
	return WriteROM(Address, Data, Lenght, true);
}
unsigned int __fastcall ROMFile::WriteROM(unsigned int Address, char * Data, int Lenght, bool PC){
	Position = PC ? Address : addr2pc(Address) + (HasHeader ? 0x200 : 0); // Headers are bad, we why people use it
	Write(Data, Lenght);
	return Address + Lenght;
}

void __fastcall ROMFile::SetDataPointer(int ID, unsigned int pointer){
	WriteROM(LevelOffset + (ID * 6), int2bytes(pointer, 3), 3);
}

void __fastcall ROMFile::SetSpritesPointer(int ID, unsigned int pointer){
	WriteROM(LevelOffset + (ID * 6) + 3, int2bytes(pointer, 3), 3);
}


unsigned int __fastcall ROMFile::FetchDataPointer(int ID){
	return dickbutt2snes(u24(ReadROM(LevelOffset + (ID * 6), 3)));
}
unsigned int __fastcall ROMFile::FetchSpritesPointer(int ID){
	return dickbutt2snes(u24(ReadROM(LevelOffset + (ID * 6) + 3, 3)));
}
unsigned int __fastcall ROMFile::FetchMainEntrancePointer(int ID){
	return dickbutt2snes(LevelMainEntranceOffset + (ID * 4));
	//return dickbutt2snes(u24(ReadROM(LevelMainEntranceOffset + (ID * 3), 3)));
}
unsigned int __fastcall ROMFile::FetchMidwayEntrancePointer(int ID){
	return dickbutt2snes(LevelMidwayEntranceOffset + (ID * 4));
	//return dickbutt2snes(u24(ReadROM(LevelMidwayEntranceOffset + (ID * 3), 3)));
}

unsigned int __fastcall ROMFile::LevelEntrance(int ID){
	return LevelsEntrances[ID];
	//return dickbutt2snes(u24(ReadROM(LevelMainEntranceOffset + (ID * 3), 3)));
}

void __fastcall ROMFile::FetchLevelsEntrances(){

	for(int X=0; X <= 55; X++){
		RAWBYTE = ReadROM(LevelMainEntranceOffsets[ReadROM(0xFFD9)][1] + (X * 4));

		LevelsEntrances[RAWBYTE] = X+1;
	}
	//return dickbutt2snes(u24(ReadROM(LevelMainEntranceOffset + (ID * 3), 3)));
}

bool __fastcall ROMFile::CheckROM(){
	return BypassCheck || TRegEx::IsMatch(Title, "(YOSSY|YOSHI).*ISLAND");
}

bool __fastcall ROMFile::RemoveHeader(){
	HasHeader = Size % 1024;
	if(HasHeader){
		Header = ReadPC(0, 0x200);
		if(MessageBoxA(NULL, "Looks like this ROM has header, do you want to remove this?", "Remove ROM Header", MB_YESNO | MB_ICONINFORMATION) == ID_YES){
			RAWBYTES = ReadPC(0x200, Size - 0x200);
			Size -= 0x200;
			WritePC(0, RAWBYTES, Size);

			HasHeader = false;
		}
	}
	return HasHeader;
}


UnicodeString __fastcall ROMFile::FetchLevel(int ID){
	return ExportLevel(ID, "");
}

LevelData __fastcall ROMFile::FetchLevelData(int ID){
	DataOffset = FetchDataPointer(ID);
	SetDataPointer(ID, DataOffset); // save current data pointer without dickbutt addr

	LevelData leveldata;
	leveldata.ID = ID;
	leveldata.pointer = DataOffset;
	leveldata.total_objects = 0;
	leveldata.total_exits = 0;

	fn_Log(sprintf("Fetching level header, objects and exits: #%02X @ $%06X", ID, addr2pc(DataOffset)));

	// Fetching Header
	leveldata.header = ReadROM(DataOffset, 10);

	// Fetching Objects
	DataOffset += 10; DataSize = 0;
	while(Position < Size && (RAWBYTE = ReadROM(DataOffset + DataSize)) != 0xFF){
		DataSize += (RAWBYTE == 0x00 || (ObjectTable[RAWBYTE] & 0x03) < 0x02) ? 4 : 5;
		leveldata.total_objects++;

		//fn_Log(sprintf("Object (%X) @ %06X", RAWBYTE, addr2pc(DataOffset + DataSize)));
	}
	DataSize++;
	leveldata.objects = ReadROM(DataOffset, DataSize);
	leveldata.size_objects = DataSize;
	fn_Log(sprintf("Objects: %02d (%02d bytes)", leveldata.total_objects, leveldata.size_objects));

	// Fetching Screen Exits
	DataOffset += DataSize; DataSize = 0;
	while(Position < Size && (RAWBYTE = ReadROM(DataOffset + DataSize)) < 0x80){
		DataSize += 5;
		leveldata.total_exits++;

		//fn_Log(sprintf("Screen Exit (%02X) @ %06X", RAWBYTE, addr2pc(DataOffset)));
	}
	DataSize++;
	leveldata.exits = ReadROM(DataOffset, DataSize);
	leveldata.size_exits = DataSize;
	fn_Log(sprintf("Screen Exits: %02d (%02d bytes)", leveldata.total_exits, leveldata.size_exits));

	leveldata.size_total = 10 + leveldata.size_objects + leveldata.size_exits;

	return leveldata;
}

LevelSprites __fastcall ROMFile::FetchLevelSprites(int ID){
	DataOffset = FetchSpritesPointer(ID);
	SetSpritesPointer(ID, DataOffset); // save current sprites pointer without dickbutt addr

	LevelSprites levelsprites;
	levelsprites.ID = ID;
	levelsprites.pointer = DataOffset;
	levelsprites.total = 0;

	fn_Log(sprintf("Parsing level sprites @ #%06X", DataOffset));

	// Fetching Sprites
	DataSize = 0;
	while(Position < Size && u16(ReadROM(DataOffset + DataSize, 2)) != 0xFFFF){
		DataSize += 3;
		levelsprites.total++;

		//fn_Log(sprintf("Sprite @ %06X", addr2pc(DataOffset + DataSize)));
	}
	DataSize+=2;
	levelsprites.data = ReadROM(DataOffset, DataSize);
	levelsprites.size = DataSize;

	fn_Log(sprintf("Sprites: %02d (%02d bytes)", levelsprites.total, levelsprites.size));

	return levelsprites;
}

LevelEntrances __fastcall ROMFile::FetchLevelEntrances(int ID){
	LevelEntrances levelentrances;
	levelentrances.ID = ID;

	levelentrances.main_pointer = LevelMainEntrances[ID] ? LevelMainEntrances[ID] : 0;
	levelentrances.midway_pointer = LevelMidwayEntrances[ID] ? LevelMidwayEntrances[ID] : 0;

	fn_Log(sprintf("Parsing level main/midway entrances @ $%06X, $%06X", levelentrances.main_pointer, levelentrances.midway_pointer));

	// Fetching Main/Midway Entrances
	//levelentrances.main = levelentrances.main_pointer > 0 ? ReadROM(levelentrances.main_pointer, 3) : x00\x00\x00";
	//levelentrances.midway = levelentrances.midway_pointer > 0 ? ReadROM(levelentrances.midway_pointer, 3) : "\x00\x00\x00";
	fn_Log(sprintf("Main: %s - Midway: %s", levelentrances.main, levelentrances.midway));

	return levelentrances;
}

void __fastcall ROMFile::FreeSpaceBlocks(){
	FreeOffset = 0; DataSize = 0; SpaceBlocks = 0;
	for(FreeOffset = 0; FreeOffset < Size; FreeOffset++){
		if((RAWBYTE = ReadPC(FreeOffset)) == 0xFF && !checkcrossbank(FreeOffset - DataSize, DataSize)){
			DataSize++;
		} else if(DataSize > 5){
			SpaceBlocksOffsets[SpaceBlocks] = FreeOffset - DataSize;
			SpaceBlocksSizes[SpaceBlocks] = DataSize;
			SpaceBlocksUsed[SpaceBlocks] = 0;

			fn_Log(sprintf("Free Space Block found at $%06X: %02d Bytes", SpaceBlocksOffsets[SpaceBlocks], DataSize));

			SpaceBlocks++;
			DataSize = 0;
		} else {
			DataSize = 0;
		}

	}
	fn_Log(sprintf("Total Free Space Blocks found: %02d", SpaceBlocks));
}
unsigned int __fastcall ROMFile::FindFreeSpace(int size){
	int Y = 0xFFFFFF; LastSize = 0; size += 3;
	for(int X = 0; X < SpaceBlocks; X++){
		DataSize = SpaceBlocksSizes[X] - SpaceBlocksUsed[X];
		if(DataSize >= size) // Has enough space
		if(LastSize == 0 || DataSize < LastSize){ // Fill it in smaller block
		//if(!checkcrossbank(SpaceBlocksOffsets[X] + SpaceBlocksUsed[X], size)){ // Address doesn't crossbank
			LastSize = DataSize;
			Y = X;
		}
	}

	if(Y < 0xFFFFFF){
		FreeOffset = SpaceBlocksOffsets[Y] + SpaceBlocksUsed[Y] + 2;
		SpaceBlocksUsed[Y] += size;
		fn_Log(sprintf("%d (%06X) = %d", Y, FreeOffset, SpaceBlocksSizes[Y] - SpaceBlocksUsed[Y]));
		return FreeOffset;
	} else return 0;
}

			/*
unsigned long __fastcall ROMFile::FindFreeSpace(unsigned long size){
	DataSize = 0; size += 2;
	for(FreeOffset = 0; FreeOffset < Size; FreeOffset++){
		if((RAWBYTE = ReadROM(addr2snes(FreeOffset))) == 0xFF){
			DataSize++;
		} else {
			DataSize = 0;
		}
		if(DataSize > size){
			fn_Log(sprintf("Free Space Block found at $%06X", FreeOffset - DataSize));
			return FreeOffset - DataSize;
		}
	}
} */

UnicodeString __fastcall ROMFile::ClearLevel(int ID){
	LevelData leveldata = FetchLevelData(ID);
	LevelSprites levelsprites = FetchLevelSprites(ID);
	char * space;

	// UPDATE POINTER ADDR
	SetDataPointer(ID, leveldata.pointer);
	SetSpritesPointer(ID, levelsprites.pointer);

	space = new char[leveldata.size_total]; // Keep Header?
	memset(space, 0xFF, leveldata.size_total);
	WriteROM(leveldata.pointer, space, leveldata.size_total);

	space = new char[levelsprites.size];
	memset(space, 0xFF, levelsprites.size);
	WriteROM(levelsprites.pointer, space, levelsprites.size);

	delete[] space;
	return FetchLevel(ID);
}

UnicodeString __fastcall ROMFile::ExportLevel(int ID, UnicodeString FileName){
	INFO = new TStringList();
	DATA = new TMemoryStream();

	fn_Log(sprintf("Exporting level objects, exits and sprites: #%02X", ID));

	// PROCESSING LEVEL DATA
	LevelData leveldata = FetchLevelData(ID);
	DATA->Write((char *) &ID, 1);
	DATA->Write(leveldata.header, 10);
	DATA->Write(leveldata.objects, leveldata.size_objects);
	DATA->Write(leveldata.exits, leveldata.size_exits);

	// PROCESSING LEVEL SPRITES
	LevelSprites levelsprites = FetchLevelSprites(ID);
	DATA->Write(levelsprites.data, levelsprites.size);

	// PROCESSING LEVEL ENTRANCES
	/*LevelEntrances levelentrances = FetchLevelEntrances(ID);
	DATA->Write(levelentrances.main, 3);
	DATA->Write(levelentrances.midway, 3); */

	// FETCHING INFORMATIONS
	INFO->Add(sprintf("$%06X", leveldata.pointer));
	INFO->Add(sprintf("$%06X", levelsprites.pointer));
	INFO->Add(sprintf("%02d (%02d B)", leveldata.total_objects, leveldata.size_objects));
	INFO->Add(sprintf("%02d (%02d B)", leveldata.total_exits, leveldata.size_exits));
	INFO->Add(sprintf("%02d (%02d B)", levelsprites.total, levelsprites.size));
	INFO->Add(sprintf("%02d B", DATA->Size));

	if(!FileName.IsEmpty()){
		DATA->SaveToFile(FileName);
	}

	DATA->Free();

	return INFO->Text;
}

UnicodeString __fastcall ROMFile::ImportLevel(int ID, UnicodeString FileName){
	LEVELFILE = new LevelFile(FileName);

	if(ID == 0xFF){
		ID = LEVELFILE->ID;
		fn_Log(sprintf("Import level using ID from the file: %d", ID));
	}

	//LevelData leveldata = FetchLevelData(ID);
	//LevelSprites levelsprites = FetchLevelSprites(ID);
	//LevelEntrances levelentrances = FetchLevelEntrances(ID);

	fn_Log(sprintf(
		"Importing to level %02X: OBJ Size: %d, EXT Size: %d, SPR Size: %d",
		ID, LEVELFILE->data.size_objects, LEVELFILE->data.size_exits, LEVELFILE->sprites.size
	));

	// WRITING LEVEL HEADER, OBJECTS, EXITS
	/*/DataOffset = leveldata.pointer;
	if(LEVELFILE->data.size_total > leveldata.size_total){
		DataOffset = FindFreeSpace(LEVELFILE->data.size_total);
	} else {
	ClearLevel(ID);

	} */

	if((DataOffset = FindFreeSpace(LEVELFILE->data.size_total)) > 0){
		SetDataPointer(ID, addr2snes(DataOffset));
		DataOffset = WritePC(DataOffset, LEVELFILE->data.header, 10);
		DataOffset = WritePC(DataOffset, LEVELFILE->data.objects, LEVELFILE->data.size_objects);
		DataOffset = WritePC(DataOffset, LEVELFILE->data.exits, LEVELFILE->data.size_exits);
	} else {
		fn_Log("Couldn't find available free space for level data");
	}

	// WRITING SPRITES
	//DataOffset = levelsprites.pointer;
	if((DataOffset = FindFreeSpace(LEVELFILE->sprites.size)) > 0){
		SetSpritesPointer(ID, addr2snes(DataOffset));
		DataOffset = WritePC(DataOffset, LEVELFILE->sprites.data, LEVELFILE->sprites.size);
	} else {
		fn_Log("Couldn't find available free space for level sprites");
	}
	// WRITING MAIN/MIDWAY ENTRANCES
	/*if(LEVELFILE->entrances.main){
		Position = addr2pc(levelentrances.main_pointer);
		Write(LEVELFILE->entrances.main, 4);
	}
	if(LEVELFILE->entrances.midway){
		Position = addr2pc(levelentrances.midway_pointer);
		Write(LEVELFILE->entrances.midway, 4);
	}  */

	if(ID == 0xFF) return "";
	else return FetchLevel(ID);
}

void __fastcall ROMFile::ExportEntrances(UnicodeString FileName){
	DATA = new TMemoryStream();
	DATA->Write(ReadROM(LevelMainEntranceOffset, 988), 988);
	DATA->SaveToFile(FileName);
	fn_Log("Main/Midway Entrances Exported");
}

void __fastcall ROMFile::ImportEntrances(UnicodeString FileName){
	DATA = new TMemoryStream();
	DATA->LoadFromFile(FileName);

	if(DATA->Size == 988){
		char entrances[988];
		DATA->Read(entrances, 988);

		WriteROM(LevelMainEntranceOffset, entrances, 988);
		fn_Log("Main/Midway Entrances Imported");
	} else {
		fn_Log("Invalid file for Main/Midway Entrances: Wrong filesize");
	}
}
