#include <vcl.h>
#pragma hdrstop

#include "main.h"
#include "about.h"
#include "patches.h"
#include "ROM.h"
#include "functions.cpp"

#pragma package(smart_init)
#pragma resource "*.dfm"
TfrsMain *frsMain;

__fastcall TfrsMain::TfrsMain(TComponent* Owner) : TForm(Owner){
	Application->Title = frsMain->Caption;
	AppPath = ExtractFilePath(Application->ExeName);
	LastDir = AppPath;
}

// EVENTS
void __fastcall TfrsMain::ev_LoadROM(TObject *Sender)
{
	TOpenDialog *OpenFile = new TOpenDialog(Application);
	OpenFile->Filter = "SNES ROM Files|*.smc;*.sfc";
	OpenFile->Options.Clear();
	OpenFile->Options << ofFileMustExist;

	if(OpenFile->Execute() && FileExists(OpenFile->FileName)){
		Levels->Clear();
		FileName = OpenFile->FileName;
		ROM = new ROMFile(OpenFile->FileName);
		fn_Log("Loaded: " + ROM->Title);

		ROMInfo->Strings->Clear();
		ROMInfo->Strings->Add("Title=" + ROM->Title);
		ROMInfo->Strings->Add("Code=" + ROM->GameCode);
		ROMInfo->Strings->Add("Region=" + ROM->Region);
		ROMInfo->Strings->Add("Version=" + ROM->Version);
		ROMInfo->Strings->Add("ROM Size=" + ROM->ROMSize);
		ROMInfo->Strings->Add("RAM Size=" + ROM->RAMSize);
		ROMInfo->Strings->Add("SRAM Size=" + ROM->ExRAMSize);
		ROMInfo->Strings->Add(sprintf("Headered=%s", (ROM->HasHeader ? "Yes" : "No")));

		if(!ROM->CheckROM() && MessageBoxA(NULL, "Invalid ROM, you need a Yoshi's Island ROM file. Do you wanna try load the level data anyway?", "Invalid Yoshi's Island ROM", MB_YESNO | MB_ICONWARNING) == ID_YES){
			ROM->BypassCheck = true;
		}

		btn_ClearLevels->Enabled = ROM->CheckROM();
		btn_ExportLevels->Enabled = ROM->CheckROM();
		btn_ImportLevels->Enabled = ROM->CheckROM();
		btn_ExportEntrances->Enabled = ROM->CheckROM();
		btn_ImportEntrances->Enabled = ROM->CheckROM();

		LoadLevels();
	}
	btn_SaveROM->Enabled = ROM ? true : false;
	btn_Patches->Enabled = ROM ? true : false;
}

void __fastcall TfrsMain::ev_SaveROM(TObject *Sender)
{
	if(ROM){
		int MSG = MessageBoxA(Handle, "Warning!\nClick on 'Yes' if you want to overwrite the opened ROM.\nIf you don't want to overwrite, click on 'No' and save as another file.", "Save Changes", MB_YESNOCANCEL | MB_ICONWARNING);
		bool Saved = false;
		if(MSG == ID_NO){
			TSaveDialog *SaveFile = new TSaveDialog(Application);
			SaveFile->Filter = "SNES ROM Files|*.smc;*.sfc";
			SaveFile->FileName = ExtractFileName(FileName);
			SaveFile->InitialDir = ExtractFileDir(FileName);
			if(SaveFile->Execute()){
				ROM->SaveToFile(SaveFile->FileName);
				Saved = true;
			}
		} else if(MSG == ID_YES){
			ROM->SaveToFile(FileName);
			Saved = true;
		}
		if(Saved){
			ShowMessage("All changes were successfully saved :)");
        }
	}
}

void __fastcall TfrsMain::ev_ToggleDebugInfo(TObject *Sender)
{
	DebugInfo->Visible = chk_DebugInfo->Checked;
}

void __fastcall TfrsMain::ev_OpenAbout(TObject *Sender)
{
	frsAbout->ShowModal();
}

void __fastcall TfrsMain::ev_ExportLevels(TObject *Sender)
{
	if(Levels->SelCount == 0)
		Levels->SelectAll();

	if(!ROM || !ROM->CheckROM()) ShowMessage("You need to load a valid ROM first...");
	else if(SelectDirectory("Directory to export the levels", "", LastDir, TSelectDirExtOpts() << sdNewUI << sdNewFolder, NULL)){
		Progress->Position = 0; Progress->Max = Levels->SelCount;
		for(int ID = 0; ID < Levels->Items->Count; ID++){
			if(Levels->Items->Item[ID]->Selected){
				Progress->Position++;
				Levels->Items->Item[ID]->SubItems->Text = ROM->ExportLevel(ID, LastDir + sprintf("/level_%02X.ylt", ID));
			}
		}
		ShowMessage("All levels were successfully exported! :D");
		if(MessageBoxA(Handle, "Do you want to export all levels entrances data too?", "Export Levels Entrances", MB_YESNO | MB_ICONINFORMATION) == ID_YES){
			ROM->ExportEntrances(LastDir + "/entrances.yet");
		}
	}
}

void __fastcall TfrsMain::ev_ImportLevels(TObject *Sender)
{
	if(ROM && ROM->CheckROM() && SelectDirectory("Directory to import the levels", "", LastDir, TSelectDirExtOpts() << sdNewUI << sdNewFolder, NULL)){
		TSearchRec FILE;
		FileList = new TStringList();
		if(FindFirst(LastDir + "\\*.ylt", faArchive, FILE) == 0){
			do {
				FileList->Add(LastDir + "/" + FILE.Name);
			} while(FindNext(FILE) == 0);
			FindClose(FILE);

			// Clear All Levels First
			for(int ID = 0; ID < 0xDE; ID++){
				//Levels->Items->Item[ID]->SubItems->Text =
				ROM->ClearLevel(ID);
			}

			ROM->FreeSpaceBlocks();

			try {
				Progress->Position = 0; Progress->Max = FileList->Count;
				for(int X = 0; X < FileList->Count; X++){
					Progress->Position++;
					ROM->ImportLevel(0xFF, FileList->Strings[X]);
				}

				LoadLevels();
				ShowMessage("All levels were successfully imported! :D");
				if(FileExists(LastDir + "/entrances.yet"))
				if(MessageBoxA(Handle, "I've found a levels entrances file on that folder. Do you wanna import this too, now?", "Import Levels Entrances", MB_YESNO | MB_ICONINFORMATION) == ID_YES){
					ROM->ImportEntrances(LastDir + "/entrances.yet");
				}
			} catch (Exception &e) {
				ShowMessage("Something wrong happened :(\n" + e.Message);
			}
		} else {
			ShowMessage("This directory doesn't have any level files! :(");
		}
	}
}

void __fastcall TfrsMain::ev_SelectAllLevels(TObject *Sender)
{
	Levels->SelectAll();
}

void __fastcall TfrsMain::ev_ImportLevel(TObject *Sender)
{
	TOpenDialog *OpenFile = new TOpenDialog(Application);
	OpenFile->Filter = "Yoshi's Island Level Files|*.ylt";
	OpenFile->Options.Clear();
	OpenFile->Options << ofFileMustExist;

	if(ROM && ROM->CheckROM())
	if(Levels->SelCount == 1){
		if(OpenFile->Execute()){
			Levels->Selected->SubItems->Text = ROM->ImportLevel(Levels->Selected->Index, OpenFile->FileName);
			ShowMessage("Level successfully imported :)");
		}
	}
}

void __fastcall TfrsMain::ev_ExportLevel(TObject *Sender)
{
	TSaveDialog *SaveFile = new TSaveDialog(Application);
	SaveFile->Filter = "Yoshi's Island Levels|*.ylt";
	SaveFile->InitialDir = LastDir;

	if(ROM && ROM->CheckROM())
	if(Levels->SelCount == 1){
		SaveFile->FileName = sprintf("level_%02X.ylt", Levels->Selected->Index);
		if(SaveFile->Execute()){
			Levels->Selected->SubItems->Text = ROM->ExportLevel(Levels->Selected->Index, ReplaceStr(SaveFile->FileName, ".ylt", "") + ".ylt");
			ShowMessage("Level exported successfully :)");
		}
	} else if(Levels->SelCount > 1){
		ev_ExportLevels(Sender);
	}
}

void __fastcall TfrsMain::ev_ClearLevel(TObject *Sender)
{
	if(ROM && ROM->CheckROM())
	if(Levels->SelCount == 1){
		if(MessageBoxA(Handle, "Are you sure you wanna clear the level data and sprites?", "Clear Level", MB_YESNO | MB_ICONWARNING) == ID_YES){
			Levels->Selected->SubItems->Text = ROM->ClearLevel(Levels->Selected->Index);
			ShowMessage("Level cleared successfully :)");
			ROM->FreeSpaceBlocks();
		}
	} else if(Levels->SelCount > 1){
		ev_ExportLevels(Sender);
	}
}

void __fastcall TfrsMain::ev_ClearLevels(TObject *Sender)
{
	if(Levels->SelCount == 0)
		Levels->SelectAll();

	if(ROM || ROM->CheckROM() && MessageBoxA(Handle, "Are you sure you wanna clear all levels data and sprites?", "Clear Levels", MB_YESNO | MB_ICONWARNING) == ID_YES){
		for(int ID = 0; ID < Levels->Items->Count; ID++){
			if(Levels->Items->Item[ID]->Selected){
				Levels->Items->Item[ID]->SubItems->Text = ROM->ClearLevel(ID);
			}
		}
		ROM->FreeSpaceBlocks();
		ShowMessage("All levels were successfully cleared! :D");
	}
}
void __fastcall TfrsMain::ev_ExportEntrances(TObject *Sender)
{
	TSaveDialog *SaveFile = new TSaveDialog(Application);
	SaveFile->Filter = "Yoshi's Island Levels Entrances|*.yet";
	SaveFile->FileName = "entrances.yet";
	SaveFile->InitialDir = LastDir;

	if(ROM && ROM->CheckROM() && SaveFile->Execute()){
		ROM->ExportEntrances(ReplaceStr(SaveFile->FileName, ".yet", "") + ".yet");
		ShowMessage("Level Entrances successfully exported! :)");
	}

}

void __fastcall TfrsMain::ev_ImportEntrances(TObject *Sender)
{
	TOpenDialog *OpenFile = new TOpenDialog(Application);
	OpenFile->Filter = "Yoshi's Island Levels Entrances|*.yet";
	OpenFile->Options.Clear();
	OpenFile->Options << ofFileMustExist;

	if(ROM && ROM->CheckROM() && OpenFile->Execute()){
		ROM->ImportEntrances(OpenFile->FileName);
		ShowMessage("Levels Entrances successfully imported! :)");
	}

}

void __fastcall TfrsMain::ev_Patches(TObject *Sender)
{
    dlgPatches->ShowModal();
}

// FUNCTIONS
void __fastcall TfrsMain::LoadLevels(){
	if(ROM && ROM->CheckROM()){
		ROM->FetchLevelsEntrances();

		Levels->Clear();
		TListItem *ITEM;
		Progress->Position = 0; Progress->Max = 0xDD;
		for(int ID = 0; ID <= 0xDD; ID++){
			ITEM = Levels->Items->Add();
			ITEM->Caption = sprintf("%02X", ID);
			ITEM->ImageIndex = ROM->LevelEntrance(ID);
			ITEM->SubItems->Text = ROM->FetchLevel(ID);
			Progress->Position++;
		}
		Levels->Width++;
	}
}

