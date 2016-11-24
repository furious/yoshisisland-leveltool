#ifndef ROMH
#define ROMH

#include "main.h"

const UnicodeString ROMSizes[] = {"4M", "8M", "16M", "32M", "64M"};
const UnicodeString RAMSizes[] = {"None", "16K", "64K", "256K", "512K", "1M"};
const UnicodeString CartTypes[] = {"ROM Only", "ROM + RAM", "ROM + RAM + Battery"};
const UnicodeString Coprocessors[] = {"DSP", "Super FX", "OBC1", "SA-1", "Other", "Custom Chip"};
const UnicodeString Regions[] = {"Japan", "USA", "Europe", "Scandinavia", "French", "Dutch", "Spanish", "German", "Italian", "Chinese", "Korean", "Common", "Canada", "Brazil", "Nintendo Gateway System", "Australia", "Other (X)", "Other (Y)", "Other (Z)"};
const unsigned int LevelOffsets[] = {0x17F77F, 0x17F7C3};
const unsigned int LevelMainEntranceOffsets[][2] = {{0x17F3A3, 0x17F42D}, {0x17F3E7, 0x17F471}}; // main entrances pointers/data
const unsigned int LevelMidwayEntranceOffsets[][2] = {{0x17F50D, 0x17F597}, {0x17F551, 0x17F5DB}}; // midway entrances pointers/data
const char ObjectTable[] = {0xFF, 0x02, 0x01, 0x01, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x01, 0x01, 0x01, 0x00, 0x01, 0x01, 0xC2, 0xC2, 0xC2, 0x00, 0x02, 0x00, 0x02, 0x02, 0x02, 0x02, 0x00, 0x01, 0x01, 0x00, 0x00, 0x02, 0x02, 0x02, 0x01, 0x01, 0x02, 0x01, 0x01, 0x82, 0x02, 0xC2, 0xC2, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x02, 0x02, 0x00, 0x02, 0x01, 0x00, 0x02, 0x02, 0x02, 0x02, 0x41, 0x00, 0x01, 0x01, 0x01, 0x00, 0x01, 0x01, 0x02, 0x02, 0x02, 0x02, 0x02, 0x01, 0x01, 0x01, 0x01, 0x01, 0x02, 0x02, 0x01, 0x00, 0xC2, 0x00, 0xC2, 0xC2, 0xC2, 0x00, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x00, 0x00, 0x00, 0x02, 0x02, 0x02, 0x02, 0x00, 0x02, 0x02, 0x01, 0x02, 0x01, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0xC2, 0xC0, 0x02, 0xC2, 0xC0, 0x00, 0x00, 0x02, 0xC0, 0xC0, 0x02, 0x00, 0x80, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x00, 0x01, 0x00, 0x82, 0x82, 0x01, 0x01, 0x01, 0x02, 0x02, 0x02, 0x02, 0x02, 0x01, 0x01, 0x01, 0x01, 0x02, 0x00, 0x00, 0x02, 0x02, 0x02, 0x02, 0x02, 0x01, 0x00, 0x02, 0x02, 0x01, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x02, 0x00, 0x80, 0x80, 0x80, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x80, 0x80, 0x00, 0x01, 0x80, 0x00, 0x01, 0x80, 0x02, 0x02, 0xC2, 0x42, 0x80, 0x80, 0x80, 0x01, 0x00, 0x02, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x02, 0x02, 0x02, 0x02, 0x01, 0x00, 0x01, 0x02, 0x01, 0x02, 0x02, 0xC2, 0xC2, 0xC2, 0x02, 0x02, 0x02, 0x02, 0x02, 0xC2, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x41, 0x02, 0x02, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};

struct LevelData {
	int ID;
	int total_objects;
	int total_exits;
	int size_objects;
	int size_exits;
	int size_total;
	unsigned int pointer;
	char *header;
	char *objects;
	char *exits;
};

struct LevelSprites {
	int ID;
	int total;
	int size;
	unsigned int pointer;
	char *data;
};

struct LevelEntrances {
	int ID;
	unsigned int main_pointer;
	unsigned int midway_pointer;
	char *main;
	char *midway;
};


class LevelFile : public TMemoryStream
{
	public:
		__fastcall LevelFile(UnicodeString FileName);
		void __fastcall FetchLevel();

		char __fastcall ReadLevel(unsigned int Address);
		char * __fastcall ReadLevel(unsigned int Address, int Lenght);

		LevelData data;
		LevelSprites sprites;
		LevelEntrances entrances;

		int ID;
		unsigned int LevelOffset, DataSize;
		unsigned char RAWBYTE;
		TMemoryStream *DATA;
};

class ROMFile : public TMemoryStream
{
	public:
		__fastcall ROMFile(UnicodeString FileName);
		//__fastcall ~ROMFile(void);

		char __fastcall ReadPC(unsigned int Address);
		char * __fastcall ReadPC(unsigned int Address, int Lenght);
		char __fastcall ReadROM(unsigned int Address);
		char * __fastcall ReadROM(unsigned int Address, int Lenght, bool PC = false);
		unsigned int __fastcall WritePC(unsigned int Address, char * Data, int Lenght);
		unsigned int __fastcall WriteROM(unsigned int Address, char * Data, int Lenght, bool PC = false);

		bool __fastcall CheckROM();
		bool __fastcall RemoveHeader();

		void __fastcall SetDataPointer(int ID, unsigned int pointer);
		void __fastcall SetSpritesPointer(int ID, unsigned int pointer);
		void __fastcall SetMainEntrancePointer(int ID, unsigned int pointer);
		void __fastcall SetMidwayEntrancePointer(int ID, unsigned int pointer);

		unsigned int __fastcall FetchDataPointer(int ID);
		unsigned int __fastcall FetchSpritesPointer(int ID);
		unsigned int __fastcall FetchMainEntrancePointer(int ID);
		unsigned int __fastcall FetchMidwayEntrancePointer(int ID);

		void __fastcall FreeSpaceBlocks();
		unsigned int __fastcall FindFreeSpace(int size);

		LevelData __fastcall FetchLevelData(int ID);
		LevelSprites __fastcall FetchLevelSprites(int ID);
		LevelEntrances __fastcall FetchLevelEntrances(int ID);
		void __fastcall FetchLevelsEntrances();
		unsigned __fastcall LevelEntrance(int ID);

		UnicodeString __fastcall ClearLevel(int ID);
		UnicodeString __fastcall FetchLevel(int ID);
		UnicodeString __fastcall ExportLevel(int ID, UnicodeString FileName);
		UnicodeString __fastcall ImportLevel(int ID, UnicodeString FileName);
		void __fastcall ExportEntrances(UnicodeString FileName);
		void __fastcall ImportEntrances(UnicodeString FileName);

		UnicodeString Title, GameCode, Region, Version, RAMSize, ExRAMSize, ROMSize, CartType;
		bool HasHeader, BypassCheck; char * Header;

		unsigned int LevelOffset, LevelMainEntranceOffset, LevelMidwayEntranceOffset, FreeOffset, DataOffset, LastSize, DataSize, ObjectSize, SpaceBlocks;
		unsigned int SpaceBlocksSizes[0xFFFFFF], SpaceBlocksUsed[0xFFFFFF], SpaceBlocksOffsets[0xFFFFFF], LevelMainEntrances[0xFF], LevelMidwayEntrances[0xFF], LevelsEntrances[0xFF];

		unsigned char RAWBYTE, *RAWBYTES;
		TStringList *INFO;
		LevelFile *LEVELFILE;
		TMemoryStream *DATA;
};
#endif
