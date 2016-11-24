#include <vcl.h>
#pragma hdrstop

#include "main.h"
#include "patches.h"
#include "asardll.h"
#include "asardll.c"
#include "functions.cpp"

#pragma package(smart_init)
#pragma resource "*.dfm"

TdlgPatches *dlgPatches;
__fastcall TdlgPatches::TdlgPatches(TComponent* Owner) : TForm(Owner){
	patches_path = frsMain->AppPath + "patches\\";
	if(!FileExists(frsMain->AppPath + "asar.dll")){
		TResourceStream *RS = new TResourceStream(NULL, "ASARDLL", RT_RCDATA);
		RS->SaveToFile(frsMain->AppPath + "asar.dll");
	}
}

void __fastcall TdlgPatches::ev_Show(TObject *Sender)
{
	cmb_Patches->Clear();
	cmb_Patches->Items->Add("Custom...");
	cmb_Patches->ItemIndex = 0;
	try {
		patches = new TIniFile(patches_path + "list.ini");
		patches_list = new TStringList();
		patches->ReadSections(patches_list);
		if(frsMain->ROM && frsMain->ROM->CheckROM()){
			for(int X=0; X < patches_list->Count; X++){
				cmb_Patches->Items->Add(patches->ReadString(patches_list->Strings[X], "title", patches_list->Strings[X]));
			}
			cmb_Patches->ItemIndex = patches_list->Count > 0 ? 1 : 0;
		}
	} catch (Exception &e){
        fn_Log("Error fetching patches: " + e.Message);
	}
	ev_Change(Sender);
}


void __fastcall TdlgPatches::ev_Apply(TObject *Sender)
{
	if(cmb_Patches->ItemIndex > 0){
		ApplyPatch(patches_list->Strings[cmb_Patches->ItemIndex-1]);
	} else {
		TOpenDialog *OpenFile = new TOpenDialog(Application);
		OpenFile->Filter = "ASAR Patches|*.asm";
		OpenFile->Options.Clear();
		OpenFile->Options << ofFileMustExist;

		if(OpenFile->Execute() && FileExists(OpenFile->FileName)){
			ApplyPatch(OpenFile->FileName, true);
		}
	}

}

bool __fastcall TdlgPatches::ApplyPatch(AnsiString patchname, bool custom)
{
	romregion = frsMain->ROM->ReadROM(0xFFD9);
	romversion = frsMain->ROM->ReadROM(0xFFDB);
	romsize = frsMain->ROM->Size;

	if(custom){
		patch_hijack = patchname;
	} else {
		patch = patches_path + patchname + ".asm";
		fn_Log("Patch: " + patch);
		patch_hijack = patches_path + sprintf("%s_%s1%d.asm", patchname, regions[romregion], romversion);
		fn_Log("Patch (hijack): " + patch_hijack);

		if(!FileExists(patch)){
			ShowMessage(sprintf("Couldn't find the file patch '%s.asm',\nmake sure you have it in the patches folder", patchname));
			return false;
		}
		if(!FileExists(patch_hijack)){
			ShowMessage(sprintf("Couldn't find the hijack file for this patch to this ROM version,\nmake sure you have it in the patches folder", patchname));
			return false;
		}
	}

	if(MessageBoxA(Handle, "Are you sure you wanna apply this patch?", "Applying Patch", MB_YESNO | MB_ICONWARNING) == ID_YES)
	if(asar_init()){
		romdata = frsMain->ROM->ReadPC(0, romsize);

		if(asar_patch(patch_hijack.c_str(), romdata, romsize, &romsize)){
			frsMain->ROM->WritePC(0, romdata, romsize);
			ShowMessage("Patch successfully applied! :)");
		} else {
			ShowMessage(sprintf("Something went wrong! :(\nAsar v%d", asar_version()));
			asar_reset();
		}
		delete[] romdata;
		asar_close();
	} else {
		ShowMessage("Couldn't load asar.dll! :(");
		return false;
	}

	return true;

}
void __fastcall TdlgPatches::ev_Change(TObject *Sender)
{
	Info->Clear();
	if(cmb_Patches->ItemIndex > 0){
		Info->Lines->Add("Author: " + patches->ReadString(patches_list->Strings[cmb_Patches->ItemIndex-1], "author", "Unknown"));
		Info->Lines->Add("Description: " + patches->ReadString(patches_list->Strings[cmb_Patches->ItemIndex-1], "description", "Unknown"));
	} else {
		Info->Lines->Add("Click in 'Apply' and browse for a custom patch you want...");
	}

}
//---------------------------------------------------------------------------

