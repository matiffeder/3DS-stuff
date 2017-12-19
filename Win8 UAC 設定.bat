@echo off
mode con cols=50 lines=23
title Win8 UAC Switcher
:Menu
Cls
@ ECHO.
@ ECHO. 1 = 開啟使用者帳戶控制
@ ECHO. 2 = 關閉使用者帳戶控制
@ ECHO.
set /p choice=      請輸入對應的數字並按 [Enter] 執行：
If /I "%Choice%"=="1" Goto open
If /I "%Choice%"=="2" Goto close
@ ECHO.
ECHO 　　　選擇無效，請重新輸入。
ping -n 2 127.1>nul 
goto menu

:open
@ ECHO.
ECHO 　　　正在開啟使用者帳戶控制…
reg add HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System /v EnableLUA /t REG_DWORD /d 1 /f>NUL 2>NUL
goto finish

:close
@ ECHO.
ECHO 　　　正在關閉使用者帳戶控制…
reg add HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System /v EnableLUA /t REG_DWORD /d 0 /f>NUL 2>NUL
goto finish

:finish
@ ECHO.
ping -n 2 127.1>nul 
ECHO 　　　設定成功！請記得重新開機。
ping -n 2 127.1>nul
exit
REM matif