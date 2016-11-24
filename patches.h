#ifndef patchesH
#define patchesH

#include <System.Classes.hpp>
#include <System.IniFiles.hpp>
#include <Vcl.Controls.hpp>
#include <Vcl.StdCtrls.hpp>
#include <Vcl.Forms.hpp>
#include <Vcl.ExtCtrls.hpp>
#include <Vcl.Imaging.pngimage.hpp>
#include <Vcl.Buttons.hpp>

const AnsiString regions[] = {"j","u","e"}; // japan, usa, europe

class TdlgPatches : public TForm
{
__published:	// IDE-managed Components
	TImage *img_Header;
	TLabel *lbl_Title;
	TLabel *lbl_Subtitle;
	TButton *btn_Apply;
	TMemo *Info;
	TComboBox *cmb_Patches;
	void __fastcall ev_Apply(TObject *Sender);
	void __fastcall ev_Show(TObject *Sender);
	void __fastcall ev_Change(TObject *Sender);
private:	// User declarations
	int romsize, romregion, romversion;
	char * romdata;
public:		// User declarations
	__fastcall TdlgPatches(TComponent* Owner);
	bool __fastcall ApplyPatch(AnsiString patchname, bool custom = false);
	AnsiString patches_path, patch_hijack, patch;
	TIniFile *patches;
	TStringList *patches_list;
};

extern PACKAGE TdlgPatches *dlgPatches;
#endif
