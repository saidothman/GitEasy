$desktopPath = [System.Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopPath "GitEasy.lnk"
$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "wscript.exe"
$shortcut.Arguments = '"' + (Join-Path $PSScriptRoot "launch.vbs") + '"'
$shortcut.WorkingDirectory = $PSScriptRoot
$shortcut.IconLocation = (Join-Path $PSScriptRoot "app_icon.ico") + ",0"
$shortcut.Description = "GitEasy - Desktop GitHub Uploader for Beginners"
$shortcut.Save()

Write-Host "Created Desktop Shortcut: $shortcutPath" -ForegroundColor Green
