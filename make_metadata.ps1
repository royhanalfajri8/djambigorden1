$files = Get-ChildItem -Path .\assets\gallery -File | Where-Object { $_.Extension -match 'jpg|jpeg|png|webp' -and $_.Name -notmatch 'logo' }
$map = @{}
foreach ($f in $files) {
    $name = $f.Name
    $ln = $name.ToLower()
    if ($ln -match 'klasik') { $cat='klasik' }
    elseif ($ln -match 'minim|minimal') { $cat='minimalis' }
    elseif ($ln -match 'blind|roller|vertical|venetian') { $cat='blinds' }
    elseif ($ln -match 'wallpap|wallpaper|^wall') { $cat='wallpaper' }
    elseif ($ln -match 'jasa|steam|tukang') { $cat='jasa' }
    else { $cat='minimalis' }
    $map[$name] = @{ category=$cat; alt='Foto Galeri' }
}
$map | ConvertTo-Json -Depth 5 | Set-Content -Path .\assets\gallery_metadata.json -Encoding utf8
