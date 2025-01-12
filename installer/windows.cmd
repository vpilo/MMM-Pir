@echo off

call :node
call :deps
call :src
exit /b

:node
echo Remove node-libgpiod library (not compatible)
call npm remove node-libgpiod
exit /b

:deps 
echo Install Dependencies
call npm prune
exit /b

:src
call cd installer && node minify
exit /b
