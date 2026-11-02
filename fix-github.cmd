@echo off
rem Double-click this file to fix github.com access (it will ask for admin via UAC).
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0fix-github-access.ps1"
