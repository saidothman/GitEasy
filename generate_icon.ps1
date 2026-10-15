Add-Type -AssemblyName System.Drawing

function Build-Ico {
    param(
        [System.Drawing.Bitmap]$sourceBmp,
        [string]$outputPath
    )
    $sizes = @(256, 128, 64, 48, 32, 16)
    $pngBytesList = @()

    foreach ($s in $sizes) {
        $resized = New-Object System.Drawing.Bitmap $s, $s
        $g = [System.Drawing.Graphics]::FromImage($resized)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $g.DrawImage($sourceBmp, 0, 0, $s, $s)
        $g.Dispose()

        $ms = New-Object System.IO.MemoryStream
        $resized.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
        $pngBytesList += ,$ms.ToArray()
        $resized.Dispose()
        $ms.Dispose()
    }

    $fs = [System.IO.File]::Create($outputPath)
    $bw = New-Object System.IO.BinaryWriter($fs)

    # ICONDIR
    $bw.Write([UInt16]0) # Reserved
    $bw.Write([UInt16]1) # Type 1 = Icon
    $bw.Write([UInt16]$sizes.Count) # Image count

    # Calculate starting offset: 6 + (16 * count)
    $offset = 6 + (16 * $sizes.Count)

    for ($i = 0; $i -lt $sizes.Count; $i++) {
        $s = $sizes[$i]
        $bytes = $pngBytesList[$i]
        $w = if ($s -eq 256) { 0 } else { [byte]$s }
        $h = if ($s -eq 256) { 0 } else { [byte]$s }

        $bw.Write([byte]$w)
        $bw.Write([byte]$h)
        $bw.Write([byte]0)   # color count
        $bw.Write([byte]0)   # reserved
        $bw.Write([UInt16]1) # planes
        $bw.Write([UInt16]32)# bit count
        $bw.Write([UInt32]$bytes.Length)
        $bw.Write([UInt32]$offset)

        $offset += $bytes.Length
    }

    # Write image data
    for ($i = 0; $i -lt $sizes.Count; $i++) {
        $bw.Write($pngBytesList[$i])
    }

    $bw.Flush()
    $fs.Close()
}

$size = 256
$bmp = New-Object System.Drawing.Bitmap $size, $size
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$g.Clear([System.Drawing.Color]::Transparent)

# Background rounded rect path
$rect = New-Object System.Drawing.RectangleF 16, 16, 224, 224
$radius = 48
$diameter = $radius * 2

$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddArc($rect.X, $rect.Y, $diameter, $diameter, 180, 90)
$path.AddArc($rect.Right - $diameter, $rect.Y, $diameter, $diameter, 270, 90)
$path.AddArc($rect.Right - $diameter, $rect.Bottom - $diameter, $diameter, $diameter, 0, 90)
$path.AddArc($rect.X, $rect.Bottom - $diameter, $diameter, $diameter, 90, 90)
$path.CloseFigure()

# Subtle shadow
$shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 0, 0, 0))
$shadowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$sRect = New-Object System.Drawing.RectangleF 16, 20, 224, 224
$shadowPath.AddArc($sRect.X, $sRect.Y, $diameter, $diameter, 180, 90)
$shadowPath.AddArc($sRect.Right - $diameter, $sRect.Y, $diameter, $diameter, 270, 90)
$shadowPath.AddArc($sRect.Right - $diameter, $sRect.Bottom - $diameter, $diameter, $diameter, 0, 90)
$shadowPath.AddArc($sRect.X, $sRect.Bottom - $diameter, $diameter, $diameter, 90, 90)
$shadowPath.CloseFigure()
$g.FillPath($shadowBrush, $shadowPath)
$shadowBrush.Dispose()
$shadowPath.Dispose()

# Gradient brush (Sky blue to Deep Indigo/Violet)
$p1 = New-Object System.Drawing.PointF 20, 20
$p2 = New-Object System.Drawing.PointF 236, 236
$c1 = [System.Drawing.Color]::FromArgb(255, 14, 165, 233)   # Sky-500 #0ea5e9
$c2 = [System.Drawing.Color]::FromArgb(255, 67, 56, 202)    # Indigo-700 #4338ca
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $p1, $p2, $c1, $c2

# Fill background
$g.FillPath($brush, $path)

# Subtle highlight border
$borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(60, 255, 255, 255), 3)
$g.DrawPath($borderPen, $path)
$borderPen.Dispose()

# Draw Git Branch & Upload Arrow
$linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 14)
$linePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$linePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

# Main vertical trunk: from (90, 175) to (90, 80)
$g.DrawLine($linePen, 90, 175, 90, 80)

# Branch curve: from (90, 138) curving to (166, 110)
$g.DrawBezier($linePen, 90, 138, 90, 112, 130, 110, 166, 110)

# Branch upload arrow: stem going up from (166, 110) to (166, 68)
$g.DrawLine($linePen, 166, 110, 166, 68)

# Arrowhead at (166, 56)
$arrowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 12)
$arrowPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$arrowPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$arrowPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$g.DrawLine($arrowPen, 146, 78, 166, 56)
$g.DrawLine($arrowPen, 186, 78, 166, 56)
$arrowPen.Dispose()

# Nodes (Circles)
$nodeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$innerBrush1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 14, 165, 233))
$innerBrush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 79, 70, 229))

# Node 1: Bottom Trunk (90, 175)
$g.FillEllipse($nodeBrush, (90 - 20), (175 - 20), 40, 40)
$g.FillEllipse($innerBrush2, (90 - 10), (175 - 10), 20, 20)

# Node 2: Top Trunk (90, 80)
$g.FillEllipse($nodeBrush, (90 - 20), (80 - 20), 40, 40)
$g.FillEllipse($innerBrush1, (90 - 10), (80 - 10), 20, 20)

# Node 3: Branch Node (166, 110)
$g.FillEllipse($nodeBrush, (166 - 20), (110 - 20), 40, 40)
$g.FillEllipse($innerBrush2, (166 - 10), (110 - 10), 20, 20)

# Save PNG
$pngPath = Join-Path $PSScriptRoot "app_icon.png"
$bmp.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

# Save Multi-resolution ICO (256, 128, 64, 48, 32, 16)
$icoPath = Join-Path $PSScriptRoot "app_icon.ico"
Build-Ico -sourceBmp $bmp -outputPath $icoPath

$linePen.Dispose()
$nodeBrush.Dispose()
$innerBrush1.Dispose()
$innerBrush2.Dispose()
$brush.Dispose()
$path.Dispose()
$g.Dispose()
$bmp.Dispose()

Write-Host "Generated $pngPath" -ForegroundColor Green
Write-Host "Generated $icoPath" -ForegroundColor Green
