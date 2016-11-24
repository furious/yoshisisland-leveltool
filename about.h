#ifndef aboutH
#define aboutH

#include <System.Classes.hpp>
#include <Vcl.Controls.hpp>
#include <Vcl.StdCtrls.hpp>
#include <Vcl.Forms.hpp>
#include <Vcl.ComCtrls.hpp>
#include <Vcl.ExtCtrls.hpp>
#include <Vcl.Imaging.pngimage.hpp>
#include <Vcl.Graphics.hpp>
#include <Vcl.Buttons.hpp>

class TfrsAbout : public TForm
{
__published:
	TButton *btn_OK;
	TLabel *lbl_Title;
	TImage *img_Background;
	TImage *img_Icon;
	TLabel *lbl_Developer;
	TBitBtn *btn_Donate;
	TBitBtn *btn_Website;
	TLabel *lbl_Greetings;
	void __fastcall ev_Donate(TObject *Sender);
	void __fastcall ev_Website(TObject *Sender);
	void __fastcall ev_Timer(TObject *Sender);
private:
	int counter;
	TTimer *timer;
public:
	__fastcall TfrsAbout(TComponent* AOwner);
};

extern PACKAGE TfrsAbout *frsAbout;
#endif    
