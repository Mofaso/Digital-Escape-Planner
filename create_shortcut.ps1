$WshShell = New-Object -comObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$Shortcut = $WshShell.CreateShortcut("$DesktopPath\Start Digital Escape Planner.lnk")
$Shortcut.TargetPath = "E:\DigitalEscapePlanner\Start Digital Escape Planner.vbs"
$Shortcut.WorkingDirectory = "E:\DigitalEscapePlanner"
$Shortcut.WindowStyle = 7
$Shortcut.IconLocation = "shell32.dll, 21"
$Shortcut.Description = "Start Digital Escape Planner (Silent)"
$Shortcut.Save()
Write-Host "Startup shortcut created on Desktop."
