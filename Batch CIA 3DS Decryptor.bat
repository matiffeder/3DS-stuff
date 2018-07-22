@echo off
setlocal EnableDelayedExpansion
echo %date% %time% >log.txt 2>&1
echo Decrypting...
for %%a in (*.3ds) do @echo | decrypt "%%a" >>log.txt 2>&1
for %%a in (*.Main.ncch) do (
	set NCCHN=%%a
	set CUTN=!NCCHN:.main.ncch=!
	set /a i=0
	set ARG=
	for %%f in ("!CUTN!.*.ncch") do (
		set ARG=!ARG! -content "%%f:!i!:!i!"
		set /a i+=1
	)
	makerom -f cci -o "!CUTN!-decrypted.3ds"!ARG! >>log.txt 2>&1
)
for %%a in (*.cia) do @echo | decrypt "%%a" >>log.txt 2>&1
for %%a in (*.0.ncch) do (
	set NCCHN=%%a
	set CUTN=!NCCHN:.0.ncch=!
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
