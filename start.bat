
@echo OFF
:: check Python version
python --version > testPython.txt


for /f "tokens=2 delims= " %%i in ('python --version') do (
	set VERSION=%%i
)

set MAJOR=%VERSION:~0,1%

cd src
if %MAJOR% GEQ 3 (
	@echo ON
	echo Using Python version 3
	python serverMain.py
) ELSE (
	@echo ON
	echo Using legacy Python version 2
	python serverMainP2.py
)



