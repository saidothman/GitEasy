Set FSO = CreateObject("Scripting.FileSystemObject")
ScriptDir = FSO.GetParentFolderName(WScript.ScriptFullName)
Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = ScriptDir

If Not FSO.FileExists(ScriptDir & "\dist\index.html") Then
    WshShell.Run "cmd.exe /c npm start", 0, False
Else
    WshShell.Run "cmd.exe /c npm run electron", 0, False
End If
