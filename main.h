#ifndef mainH
#define mainH

#include <System.Classes.hpp>
#include <System.StrUtils.hpp>
#include <System.RegularExpressions.hpp>
#include <Vcl.Controls.hpp>
#include <Vcl.StdCtrls.hpp>
#include <Vcl.Forms.hpp>
#include <Vcl.Grids.hpp>
#include <Vcl.ValEdit.hpp>
#include <Vcl.ComCtrls.hpp>
#include <Vcl.ExtCtrls.hpp>
#include <Vcl.Imaging.pngimage.hpp>
#include <Vcl.Graphics.hpp>
#include <Vcl.ImgList.hpp>
#include <Vcl.FileCtrl.hpp>
#include <Vcl.Menus.hpp>
#include <System.ImageList.hpp>
#include <Vcl.ToolWin.hpp>

#include "ROM.h"


class TfrsMain : public TForm
{
__published:
	TMemo *DebugInfo;
	TButton *btn_LoadROM;
	TImage *img_Header;
	TListView *Levels;
	TButton *btn_ExportLevels;
	TButton *btn_ImportLevels;
	TCheckBox *chk_DebugInfo;
	TImage *img_Icon;
	TImageList *img_Levels;
	TValueListEditor *ROMInfo;
	TPopupMenu *mnu_Levels;
	TMenuItem *mo_SelectAllLevels;
	TMenuItem *mo_ImportLevel;
	TMenuItem *mo_ExportLevel;
	TButton *btn_SaveROM;
	TMenuItem *mo_ClearLevel;
	TButton *btn_ClearLevels;
	TButton *btn_ExportEntrances;
	TButton *btn_ImportEntrances;
	TButton *btn_Patches;
	TProgressBar *Progress;
	TImageList *img_Buttons;
	void __fastcall ev_LoadROM(TObject *Sender);
	void __fastcall ev_ToggleDebugInfo(TObject *Sender);
	void __fastcall ev_OpenAbout(TObject *Sender);
	void __fastcall ev_ExportLevels(TObject *Sender);
	void __fastcall ev_ImportLevels(TObject *Sender);
	void __fastcall ev_SelectAllLevels(TObject *Sender);
	void __fastcall ev_ImportLevel(TObject *Sender);
	void __fastcall ev_ExportLevel(TObject *Sender);
	void __fastcall ev_SaveROM(TObject *Sender);
	void __fastcall ev_ClearLevel(TObject *Sender);
	void __fastcall ev_ClearLevels(TObject *Sender);
	void __fastcall ev_ExportEntrances(TObject *Sender);
	void __fastcall ev_ImportEntrances(TObject *Sender);
	void __fastcall ev_Patches(TObject *Sender);
private:
	TStringList *FileList;
public:
	__fastcall TfrsMain(TComponent* Owner);
	void __fastcall LoadLevels();
	UnicodeString AppPath, LastDir, FileName;
	ROMFile *ROM;
};

extern PACKAGE TfrsMain *frsMain;
#endif
