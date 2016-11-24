#include <vcl.h>
#pragma hdrstop

#include "main.h"
#include "about.h"

#pragma package(smart_init)
#pragma resource "*.dfm"
TfrsAbout *frsAbout;

__fastcall TfrsAbout::TfrsAbout(TComponent* AOwner) : TForm(AOwner){
	counter = 0;
	timer = new TTimer(AOwner);
	timer->Interval = 300;
	timer->OnTimer = ev_Timer;
	timer->Enabled = true;
}

void __fastcall TfrsAbout::ev_Donate(TObject *Sender)
{
	ShellExecuteA(NULL, "open", "http://furious.pro/donate", NULL, NULL, SW_NORMAL);
}

void __fastcall TfrsAbout::ev_Website(TObject *Sender)
{
	ShellExecuteA(NULL, "open", "http://furious.pro", NULL, NULL, SW_NORMAL);
}

void __fastcall TfrsAbout::ev_Timer(TObject *Sender)
{
	if(counter == 3) counter = -counter;
	if(counter >= 0) img_Icon->Top++;
	else img_Icon->Top--;
	counter++;
}
