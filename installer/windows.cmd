@echo off

call :welcome
call :node
call :deps
call :src
exit /b

:welcome
echo.
echo Welcome to MMM-Pir installer
echo ----
echo.
exit /b

:node
echo.
echo Remove node-libgpiod library (not compatible)
echo ----
echo.
call npm remove node-libgpiod
exit /b

:deps
echo.
echo Install Dependencies
echo ----
echo.
call npm prune
exit /b

:src
echo.
echo Install src files
echo ----
echo.
call cd installer && node minify
echo.
exit /b
