@echo off

call :welcome
call :clean
call :pull
call :install
exit /b

:welcome
echo.
echo Welcome to MMM-Pir updater
echo ----
echo.
exit /b

:clean
echo.
echo Cleaning MMM-Pir Core
echo ----
echo.
call npm run reset
exit /b

:pull
echo.
echo Update MMM-Pir core
echo ----
echo.
call git pull
exit /b

:install
echo.
echo Setup MMM-Pir
echo ----
echo.
call npm run setup
exit /b
