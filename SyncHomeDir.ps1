# Set current directory to the script's directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $scriptDir


$homeDir = $env:USERPROFILE
$sourceDir = "$homeDir\.vscode\extensions"
$targetDir = "$scriptDir\.vscode\extensions"

# if the target directory does not exist, create it
if (-not (Test-Path -Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir
}

Robocopy.exe $sourceDir $targetDir /E 
