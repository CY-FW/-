#requires -Version 5.1
<#
  修复 github.com 打不开的问题（DNS 返回的 GitHub 边缘节点 IP 在本网络不可达）。
  做法：探测可用的 GitHub 边缘 IP，把 github.com / www.github.com / octocaptcha.com
        写进 hosts（带标记块，可一键还原）。

  用法：
    1) 右键“使用 PowerShell 运行”，或直接双击本文件所在目录的 run 脚本；
       脚本会自动请求管理员权限（会弹 UAC）。
    2) 还原：  .\fix-github-access.ps1 -Revert
    3) 只看探测结果不改 hosts：  .\fix-github-access.ps1 -DryRun
#>
[CmdletBinding()]
param(
    [switch]$Revert,
    [switch]$DryRun,
    [string[]]$Candidates = @(
        '20.27.177.113',   # GitHub 亚洲边缘节点
        '140.82.112.3',
        '140.82.113.3',
        '140.82.114.3',
        '20.200.245.247'
    )
)

$ErrorActionPreference = 'Stop'
$HostsPath   = Join-Path $env:SystemRoot 'System32\drivers\etc\hosts'
$MarkerBegin = '# >>> dsh-github-fix >>>'
$MarkerEnd   = '# <<< dsh-github-fix <<<'
$Domains     = @('github.com', 'www.github.com', 'octocaptcha.com')

function Test-Admin {
    $p = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $p.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Get-HttpCode([string]$Domain, [string]$Ip, [int]$TimeoutSec = 8) {
    $out = & curl.exe -s -o NUL -w '%{http_code}' -m $TimeoutSec --resolve "${Domain}:443:$Ip" "https://$Domain/" 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $out) { return '000' }
    return $out.Trim()
}

function Get-LatencyMs([string]$Ip) {
    $p = New-Object System.Net.NetworkInformation.Ping
    $times = @()
    foreach ($i in 1..3) {
        try { $r = $p.Send($Ip, 1500); if ($r.Status -eq 'Success') { $times += [double]$r.RoundtripTime } } catch { }
    }
    if ($times.Count -eq 0) { return [double]::MaxValue }
    return [math]::Round(($times | Measure-Object -Average).Average, 0)
}

function Remove-HostsBlock([string]$Path) {
    $lines = Get-Content -LiteralPath $Path -ErrorAction SilentlyContinue
    if (-not $lines) { return $false }
    $out = New-Object System.Collections.Generic.List[string]
    $inside = $false; $changed = $false
    foreach ($line in $lines) {
        if ($line.Trim() -eq $MarkerBegin) { $inside = $true; $changed = $true; continue }
        if ($line.Trim() -eq $MarkerEnd)   { $inside = $false; continue }
        if (-not $inside) { $out.Add($line) }
    }
    if ($changed) { Set-Content -LiteralPath $Path -Value $out -Encoding ASCII }
    return $changed
}

# ---------- 还原模式 ----------
if ($Revert) {
    if (-not (Test-Admin)) {
        Write-Host '需要管理员权限来还原 hosts，正在提权...' -ForegroundColor Yellow
        Start-Process powershell -Verb RunAs -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',"`"$PSCommandPath`"",'-Revert')
        return
    }
    if (Remove-HostsBlock $HostsPath) { Write-Host '已移除 hosts 中的 github 修复条目。' -ForegroundColor Green }
    else { Write-Host 'hosts 中没有找到修复条目，无需还原。' -ForegroundColor DarkGray }
    ipconfig /flushdns | Out-Null
    Write-Host 'DNS 缓存已刷新。'
    Start-Sleep -Seconds 2
    return
}

# ---------- 1. 探测可用 IP ----------
Write-Host '正在探测可用的 GitHub 边缘节点...' -ForegroundColor Cyan
$results = foreach ($ip in $Candidates) {
    $code = Get-HttpCode 'github.com' $ip
    $ms   = Get-LatencyMs $ip
    $ok   = ($code -match '^(200|301|302)$')
    [pscustomobject]@{ IP = $ip; HTTP = $code; LatencyMs = $ms; Usable = $ok }
}
$results | Format-Table -AutoSize | Out-String | Write-Host

$best = $results | Where-Object Usable | Sort-Object LatencyMs | Select-Object -First 1
if (-not $best) {
    Write-Host '所有候选 IP 都不可用。可能当前网络对 GitHub 做了整体阻断，只能使用代理/VPN。' -ForegroundColor Red
    if (-not $DryRun) { Read-Host '按回车退出' }
    exit 1
}
Write-Host ("选用 IP: {0}  (HTTP {1}, 延迟 {2} ms)" -f $best.IP, $best.HTTP, $best.LatencyMs) -ForegroundColor Green

# 逐个域名验证该 IP 能否正常提供页面
$usableDomains = foreach ($d in $Domains) {
    $c = Get-HttpCode $d $best.IP
    "{0,-16} -> HTTP {1}" -f $d, $c | Write-Host
    if ($c -match '^(200|301|302)$') { $d }
}
if (-not $usableDomains) { Write-Host '该 IP 对这些域名都不可用。' -ForegroundColor Red; exit 1 }

if ($DryRun) {
    Write-Host "`n[DryRun] 将写入 hosts 的内容：" -ForegroundColor Yellow
    $usableDomains | ForEach-Object { "  $($best.IP)`t$_" }
    exit 0
}

# ---------- 2. 需要管理员权限写 hosts ----------
if (-not (Test-Admin)) {
    Write-Host "`n写入 hosts 需要管理员权限，正在提权（会弹出 UAC，请点“是”）..." -ForegroundColor Yellow
    Start-Process powershell -Verb RunAs -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',"`"$PSCommandPath`"")
    return
}

$backup = "$HostsPath.bak-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item -LiteralPath $HostsPath -Destination $backup -Force
Write-Host "已备份 hosts -> $backup" -ForegroundColor DarkGray

Remove-HostsBlock $HostsPath | Out-Null
$block = New-Object System.Collections.Generic.List[string]
$block.Add('')
$block.Add($MarkerBegin)
$block.Add("# 生成时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  由 fix-github-access.ps1 写入")
$block.Add("# 还原请运行: .\fix-github-access.ps1 -Revert")
foreach ($d in $usableDomains) { $block.Add("$($best.IP)`t$d") }
$block.Add($MarkerEnd)
Add-Content -LiteralPath $HostsPath -Value $block -Encoding ASCII

ipconfig /flushdns | Out-Null
Write-Host "hosts 已更新，DNS 缓存已刷新。" -ForegroundColor Green

# ---------- 3. 验证 ----------
Write-Host "`n验证（走系统 DNS + hosts）：" -ForegroundColor Cyan
foreach ($d in $usableDomains) {
    $c = & curl.exe -s -o NUL -w '%{http_code}' -m 12 "https://$d/" 2>$null
    "{0,-16} -> HTTP {1}" -f $d, $c | Write-Host
}
Write-Host "`n完成。浏览器里如果还打不开，请完全关闭浏览器再重开（DNS 缓存）。" -ForegroundColor Green
Write-Host '还原命令: .\fix-github-access.ps1 -Revert' -ForegroundColor DarkGray
Read-Host '按回车退出'
