@echo off
mode con cols=50 lines=23
title SMB Switcher
:Menu
Cls
@ ECHO.
@ ECHO. 1 = 開啟 SMB
@ ECHO. 2 = 關閉 SMB
@ ECHO.
set /p choice= 請輸入對應的數字並按 [Enter] 執行：
If /I "%Choice%"=="1" Goto open
If /I "%Choice%"=="2" Goto close
@ ECHO.
ECHO 選擇無效，請重新輸入。
ping -n 2 127.1>nul 
goto menu

:open
@ ECHO.
ECHO 正在開啟 SMB…
reg ADD HKLM\SYSTEM\CurrentControlSet\Control\Lsa /v LmCompatibilityLevel /t REG_DWORD /d 1 /f
goto finish

:close
@ ECHO.
ECHO 正在關閉 SMB…
reg DELETE HKLM\SYSTEM\CurrentControlSet\Control\Lsa /v LmCompatibilityLevel /f
goto finish

:finish
@ ECHO.
ping -n 2 127.1>nul 
ECHO 　　　設定成功！
ping -n 2 127.1>nul
exit
REM matif