# PowerShell script to start OpenResty/nginx with the correct config and root
$ErrorActionPreference = 'Stop'

$openresty = "nginx.exe"
$config = "openresty/conf/nginx1.conf"
$root = "."

Write-Host "Starting OpenResty (nginx.exe)..."
Start-Process -FilePath $openresty -ArgumentList "-p $root -c $config"
Write-Host "OpenResty started (running in background)."
