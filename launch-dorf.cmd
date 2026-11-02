@echo off
setlocal
pushd "%~dp0desktop" || exit /b 1
where node.exe >nul 2>&1
if errorlevel 1 goto missing_node
where npm.cmd >nul 2>&1
if errorlevel 1 goto missing_node
if exist "node_modules\electron\dist\electron.exe" goto launch
echo Installing the Electron desktop runtime. This first launch requires internet access.
call npm.cmd install --no-audit --no-fund
if errorlevel 1 goto failed
:launch
node.exe launch.cjs %*
if errorlevel 1 goto failed
popd
exit /b 0
:missing_node
echo Dorf requires Node.js LTS. Install it from https://nodejs.org/ and reopen this launcher.
goto failed
:failed
echo Dorf could not start. See the error above.
pause
popd
exit /b 1
