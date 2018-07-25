@echo off
mode con cols=50 lines=23
title CIA Downloader
SetLocal EnableDelayedExpansion

:menu
cls
set INPUT=0
echo.
set /p INPUT=Enter the Title ID of the Game:
call :STRLEN %INPUT%, LEN
if %LEN%==16 goto DownloadCIA
echo.
echo Please Enter a Valid ID, eg. 0004000000030800 or 0004000000040a00, Enter to Continue.
pause >nul
goto menu

:STRLEN string len
set "token=#%~1" & set "len=0"
for /L %%a in (12,-1,0) do (
    set/a "len|=1<<%%a"
    for %%i in (!len!) do if "!token:~%%i,1!"=="" set/A "len&=~1<<%%a"
)
set %~2=%len%
exit/B

:DownloadCIA
cls
echo.
echo Downloding...
aria2c http://3ds.titlekeys.gq/ticket/%INPUT% --dir=./%INPUT% --out=cetk --conf-path=aria2.conf >nul
aria2c http://nus.cdn.c.shop.nintendowifi.net/ccs/download/%INPUT%/tmd --dir=./%INPUT% --conf-path=aria2.conf >nul
nustool %INPUT% >nul
for /f %%i in ('dir .\%INPUT% /ad /b') do set FOLDN=%%i
move .\%INPUT%\%FOLDN%\* .\%INPUT%\ >nul
cls
echo.
set GNAME=
set /p GNAME=Enter the Name of the Game:
cls
make_cdn_cia %INPUT% "%GNAME%.cia" >nul
echo.
echo Finished, please press any key to exit.
pause >nul
REM matif
