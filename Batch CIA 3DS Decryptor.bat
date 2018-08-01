@echo off
setlocal EnableDelayedExpansion
echo %date% %time% >log.txt 2>&1
echo Decrypting...
for %%a in (*.3ds) do (
	echo | decrypt "%%a" >>log.txt 2>&1
	set CUTN=%%~na
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
	makerom -f cci -ignoresign -target p -o "!CUTN!-decrypted.3ds"!ARG! >>log.txt 2>&1
)
for %%a in (*.ncch) do del "%%a" >nul
for %%a in (*.cia) do (
	echo | decrypt "%%a" >>log.txt 2>&1
	set CUTN=%%~na
	set /a i=0
	set ARG=
	for %%f in ("!CUTN!.*.ncch") do (
		set ARG=!ARG! -i "%%f:!i!:!i!"
		set /a i+=1
	)
	makerom -f cia -ignoresign -target p -o "!CUTN!-decrypted.cia"!ARG! >>log.txt 2>&1
)
for %%a in (*-decrypted.cia) do makerom -ciatocci "%%a" >>log.txt 2>&1
for %%a in (*-decrypted.cia) do del "%%a" >nul
for %%a in (*.ncch) do del "%%a" >nul
cls
echo Finished, please press any key to exit.
pause >nul
rem matif
