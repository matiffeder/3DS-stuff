@echo off
setlocal EnableDelayedExpansion
echo %date% %time% >log.txt 2>&1
echo Decrypting...
for %%a in (*.cia) do (
	echo | decrypt "%%a" >>log.txt 2>&1
	ctrtool -tmd "%%a" >content.txt
	set CUTN=%%~na
	set TEXT="Content id"
	set FILE="content.txt"
	set /a X=0
	set /a i=0
	set ARG=
	for %%h in ("!CUTN!.*.ncch") do (
		set NCCHN=%%~nh
		set /a n=!NCCHN:%%~na.=!
		if !n! gtr !X! set /a X=!n!
	)
	for /f "delims=" %%d in ('findstr /c:!TEXT! !FILE!') do (
		set CONLINE=%%d
		call :EXF
	)
	makerom -f cia -dlc -ignoresign -target p -o "!CUTN!-decrypted.cia"!ARG! >>log.txt 2>&1
)
for %%a in (*.ncch) do del "%%a" >nul
del content.txt >nul
cls
echo Finished, please press any key to exit.
pause >nul
exit

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
