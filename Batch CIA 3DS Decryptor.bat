@echo off

REM Edited by Excallypurr
REM Last Edit: 11-12-20 2:25AM

mode con cols=100 lines=26
title Batch CIA 3DS Decryptor
SetLocal EnableDelayedExpansion
set count=0
echo %date% %time% >log.txt 2>&1
:SetEncrypt
if not exist locations.txt (
	set "EncryptLocation="
	set /p EncryptLocation="Where are the .3DS/.cia files located: "
	if exist "!EncryptLocation!" call :SlashChecker !EncryptLocation! encrypted

	) else ( 
		call :NotExist Encrypt "!EncryptLocation!"
	)
	echo.
	:SetDecrypt
	set "DecryptLocation="
	echo Where do you want the decrypted files to be stored? 
	set /p DecryptLocation="Leave blank for the same directory as the original files: "
	if exist "!DecryptLocation!" call :SlashChecker !DecryptLocation! decrypted
	) 
	if not exist "!DecryptLocation!" ( 
		call :NotExist Decrypt "!DecryptLocation!"
	)
)
:ScanLocations
for /f "tokens=2 delims=;" %%a in (locations.txt) do (
	if !count!==0 set encrypted=%%a
	if !count!==1 set decrypted=%%a
	set /a count=count+1
)
cls
echo Copying files to target directory...
for %%a in (*.exe) do copy %%a !encrypted!>nul
echo Successfully copied!
cls
echo Decrypting...This process can take a few minutes
cd !encrypted!
for %%a in (*.ncch) do del "%%a" >nul
for %%a in (*.3ds) do (
	set CUTN=%%~na
	if /i x!CUTN!==x!CUTN:decrypted=! (
		echo | decrypt "%%a" >>log.txt 2>&1
		set ARG=
		for %%f in ("!CUTN!.*.ncch") do (
			if %%f==!CUTN!.Main.ncch set i=0
			if %%f==!CUTN!.Manual.ncch set i=1
			if %%f==!CUTN!.DownloadPlay.ncch set i=2
			if %%f==!CUTN!.Partition4.ncch set i=3
			if %%f==!CUTN!.Partition5.ncch set i=4
			if %%f==!CUTN!.Partition6.ncch set i=5
			if %%f==!CUTN!.N3DSUpdateData.ncch set i=6
			if %%f==!CUTN!.UpdateData.ncch set i=7
			set ARG=!ARG! -i "%%f:!i!:!i!"
		)
		makerom -f cci -ignoresign -target p -o "!decrypted!\!CUTN!-decrypted.3ds"!ARG! >>log.txt 2>&1
	)
)
for %%a in (*.cia) do (
	set CUTN=%%~na
	if /i x!CUTN!==x!CUTN:decrypted=! (
		ctrtool -tmd "%%a" >content.txt
		set FILE="content.txt"
		set /a i=0
		set ARG=
		findstr /pr "^T.*D.*00040000" !FILE! >nul
		if not errorlevel 1 (
			echo | decrypt "%%a" >>log.txt 2>&1
			for %%f in ("!CUTN!.*.ncch") do (
				set ARG=!ARG! -i "%%f:!i!:!i!"
				set /a i+=1
			)
			makerom -f cia -ignoresign -target p -o "!CUTN!-decfirst.cia"!ARG! >>log.txt 2>&1
		)
		findstr /pr "^T.*D.*0004000E ^T.*D.*0004008C" !FILE! >nul
		if not errorlevel 1 (
			set TEXT="Content id"
			set /a X=0
			echo | decrypt "%%a" >>log.txt 2>&1
			for %%h in ("!CUTN!.*.ncch") do (
				set NCCHN=%%~nh
				set /a n=!NCCHN:%%~na.=!
				if !n! gtr !X! set /a X=!n!
			)
			for /f "delims=" %%d in ('findstr /c:!TEXT! !FILE!') do (
				set CONLINE=%%d
				call :EXF
			)
			findstr /pr "^T.*D.*0004000E" !FILE! >nul
			if not errorlevel 1 makerom -f cia -ignoresign -target p -o "!CUTN! (Patch)-decrypted.cia"!ARG! >>log.txt 2>&1
			findstr /pr "^T.*D.*0004008C" !FILE! >nul
			if not errorlevel 1 makerom -f cia -dlc -ignoresign -target p -o "!CUTN! (DLC)-decrypted.cia"!ARG! >>log.txt 2>&1
		)
	)
)
del content.txt >nul
for %%a in (*-decfirst.cia) do (
	set CUTN=%%~na
	makerom -ciatocci "%%a" -o "!CUTN:-decfirst=-decrypted!.cci" >>log.txt 2>&1
)
for %%a in (*-decfirst.cia) do del "%%a" >nul
for %%a in (*.ncch) do del "%%a" >nul
for %%a in (*.exe) do del %%a
cls
echo Finished, please press any key to exit.
pause >nul
exit

:NotExist
echo "this is var 1" %1
echo "this is var 2" %2
if %1==Decrypt if %2=="" (
	echo decrytped=;!EncryptLocation!;>>locations.txt
	goto :ScanLocations
)
echo Directory does not exist, please enter a valid directory!
timeout >nul 1
cls
goto :Set%1

:SlashChecker
set PassThrough=%1
set SlashCheck=!PassThrough:~-1!
if "!SlashCheck!"=="/" goto :SlashTrue
if "!SlashCheck!"=="\" goto :SlashTrue
echo %2=;%1;>>locations.txt
goto :eof
:SlashTrue
set PassThrough=!PassThrough:~0,-1!
echo %2=;!PassThrough!;>>locations.txt
goto :eof

:EXF
if !X! geq !i! (
	if exist !CUTN!.!i!.ncch (
		set CONLINE=!CONLINE:~24,8!
		call :GETX !CONLINE!, ID
		set ARG=!ARG! -i "!CUTN!.!i!.ncch:!i!:!ID!"
		set /a i+=1
	) else (
		set /a i+=1
		goto EXF
	)
)
exit/B

:GETX v dec
set /a dec=0x%~1
if [%~2] neq [] set %~2=%dec%
exit/b

rem matif
