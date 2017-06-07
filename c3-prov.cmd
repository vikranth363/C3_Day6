@ECHO off
SETLOCAL
SET APP_DIR=%localappdata%\c3\nodeapps\prov
SET APP_OPTS= -A prov

SET CACHE_PATH=%tmp%\c3\nodeapps\__cache
SET APP_PACKAGE_PATH=%localappdata%\c3\apps\packages
SET TMP_PATH=%tmp%\c3-prov-tmp
SET OS_TYPE=windows
SET DEV_NULL=NUL
SET HOME=%userprofile%

:main
SET callFunc=%1 %*
IF -%1-==-- (
  CALL :help
) ELSE (
  REM Hacky code. Make it better (and still readable) if you can
  IF "%1"=="install" ( CALL :%callFunc%
  ) ELSE IF "%1"=="uninstall" ( CALL :%callFunc%
  ) ELSE IF "%1"=="help" ( CALL :%callFunc%
  ) ELSE IF "%1"=="tag" ( CALL :%callFunc%
  ) ELSE IF "%1"=="tenant" ( CALL :%callFunc%
  ) ELSE IF "%1"=="data" ( CALL :%callFunc%
  ) ELSE IF "%1"=="user" ( CALL :%callFunc%
  ) ELSE IF "%1"=="key" ( echo "'c3-prov key' is currently not supported on Windows. To get the private key to use on Windows, go to C3 Workbench/Console and enter Cluster.provision({command:'key', printPvtKey: true})"
  ) ELSE IF "%1"=="all" ( CALL :%callFunc%
  ) ELSE ( CALL :help %* )
)
GOTO :end

:installNodeDependencies
  echo Installing dependencies at %APP_DIR%

  SET PWD=%cd%
  IF NOT EXIST %APP_DIR% (
    md %APP_DIR%
    IF %ERRORLEVEL% NEQ 0 (
      echo Cannot create directory %APP_DIR%
      exit /b 1
    )
  )
  CD /D %APP_DIR%

  REM c3-prov dependencies
  CALL npm install node-dir@0.1.6 superagent@1.1.0 commander@2.7.1 underscore@1.8.2 archiver@0.14.3 rimraf@2.3.2 graceful-fs@3.0.6 colors@1.0.3 glob@5.0.3 node-xml-lite@0.0.3 ansimd@0.2.0 less@2.5.0 chokidar@1.0.1 toposort@0.2.12

  xcopy /y %PWD%\c3.js %APP_DIR%
  xcopy /y %PWD%\package.json %APP_DIR%

  CALL npm install

  CD /D %PWD%
  REM SETX PATH "%path%;%APP_DIR%"
  exit /b %ERRORLEVEL%

:checkNodeInstallation
  echo Detecting Node.js installation...
  WHERE node 1>NUL 2>NUL

  IF %ERRORLEVEL% NEQ 0 (
    echo Node is not installed. Please install Node.js from https://nodejs.org/
    exit /b 1
  )
  IF NOT EXIST %TMP_PATH% (
    md %TMP_PATH%
    IF %ERRORLEVEL% NEQ 0 (
      echo Cannot create directory %TMP_PATH%
      exit /b 1
    )
  )

  SET nodeVersion=%TMP_PATH%\node-version.txt
  CALL node --version > %nodeVersion%
  SET /p NODE_VERSION=<%nodeVersion%
  CALL del %nodeVersion%
  echo Node.js %NODE_VERSION% detected.
  IF "%NODE_VERSION%" LSS "v0.12.0" (
      echo Please update Node.js. c3-prov requires at least v0.12.0.
      exit /b 1
  )
  exit /b 0

:install
  CALL :checkNodeInstallation
  if %ERRORLEVEL% EQU 0 (
    CALL :uninstall
    if %ERRORLEVEL% EQU 0 (
      CALL :installNodeDependencies
    )
  )
  exit /b %ERRORLEVEL%

:uninstall
  echo Removing %APP_DIR% ...
  rmdir /s /q %APP_DIR%
  exit /b %ERRORLEVEL%

:provision
  CALL :getArgsExceptFirst %*
  IF EXIST %APP_DIR%\c3.js (
    node %APP_DIR%\c3.js %APP_OPTS% %after1%
    exit /b %ERRORLEVEL%
  ) ELSE (
    echo Please run 'c3-prov install' before provisioning
    exit /b 1
  )

:version
  SET APP_OPTS= %APP_OPTS% --version
  CALL :provision %*
  exit /b %ERRORLEVEL%

:tenant
  SET APP_OPTS= %APP_OPTS%  --all-tags
  CALL :provision %*
  exit /b %ERRORLEVEL%

:tag
  SET APP_OPTS= %APP_OPTS%  --one-tag
  CALL :provision %*
  exit /b %ERRORLEVEL%

:data
  SET APP_OPTS= %APP_OPTS%  --provData
  CALL :provision %*
  exit /b %ERRORLEVEL%

:user
  SET APP_OPTS= %APP_OPTS%  --provUserCmd
  CALL :provision %*
  exit /b %ERRORLEVEL%

:key
  SET APP_OPTS= %APP_OPTS%  --provKey
  CALL :provision %*
  exit /b %ERRORLEVEL%

:all
  SET APP_OPTS= %APP_OPTS%  --all-tenants
  CALL :provision %*
  exit /b %ERRORLEVEL%

:help
  SET APP_OPTS=%APP_OPTS% --help
  CALL :getArgsExceptFirst %*
  SET callFunc=%2 %after1%
  IF "%2"=="tenant" ( CALL :%callFunc%
  ) ELSE IF "%2"=="tag" ( CALL :%callFunc%
  ) ELSE IF "%2"=="data" ( CALL :%callFunc%
  ) ELSE IF "%2"=="user" ( CALL :%callFunc%
  ) ELSE IF "%2"=="key" ( CALL :%callFunc%
  ) ELSE IF "%2"=="all" ( CALL :%callFunc%
  ) ELSE (
    CALL :usage
    CALL :provision %*
  )
  REM IF "%1"=="key" SET CMD=key
  exit /b %ERRORLEVEL%

:getArgsExceptFirst
SET after1=
SHIFT
:loop
IF -%1-==-- exit /b 0
SET after1=%after1% %1
SHIFT
GOTO :loop

:usage
  echo.
  echo c3-prov -- Provisions apps, data, users and keys on C3 Energy's platform
  echo.
  echo Usage:
  echo c3-prov [command] [options] [arguments]
  echo     c3-prov install                       installs node and dependencies
  echo     c3-prov uninstall                     uninstalls node and dependencies
  echo     c3-prov version                       shows version
  echo     c3-prov help [command]                shows help for the command
  echo     c3-prov tenant [options] [arguments]  provisions all the tags for a tenant
  echo     c3-prov tag [options] [arguments]     provisions a tag for a tenant
  echo     c3-prov data [options] [arguments]    provisions seed data for a tenant and a tag
  echo     c3-prov user [options] [arguments]    provisions user, password and groups
  echo     c3-prov key [options] [arguments]     generates C3 keys and provisions public key
  echo     c3-prov all [options] [arguments]     provisions all the tenants and tags (TEST ONLY)
  exit /b 0

:end
ENDLOCAL