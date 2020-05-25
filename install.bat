cls
@echo off 

set pathProject = ""
set /P pathProject=Enter path (Default: C:\projects\diplom-services\):

if NOT DEFINED pathProject (
    echo Set default path to project C:\projects\diplom-services\
    set pathProject=C:\projects\diplom-services\
)

cd %pathProject%

cd client
echo %cd%
echo Install Client start
call yarn install

cd ../
echo %cd%
echo Install Server start
call yarn install

echo Install end.
pause
exit