# ==============================================================================
# سكربت الإعداد التلقائي والتحسين لنظام Windows 11 VPS
# يقوم بتثبيت البرامج الأساسية، تسريع النظام، وتجهيزه لاستقبال التطبيقات
# ==============================================================================

# تشغيل بصلاحيات المسؤول (Run as Administrator)
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "يرجى تشغيل هذا السكربت بصلاحيات المسؤول (Run as Administrator)!"
    Exit
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  بدء إعداد وتجهيز Windows 11 VPS وتثبيت اللوازم الأساسية" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. تفعيل بروتوكول TLS 1.2 لدعم التنزيلات الآمنة
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# 2. تثبيت مدير الحزم Chocolatey إذا لم يكن مثبتاً
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "[1/5] جاري تثبيت Chocolatey Package Manager..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
} else {
    Write-Host "[1/5] Chocolatey مثبت مسبقاً." -ForegroundColor Green
}

# 3. قائمة البرامج الأساسية لنظام VPS
$essentialApps = @(
    "googlechrome",    # متصفح كروم
    "7zip",            # فك وضغط الملفات
    "filezilla",       # عميل نقل الملفات SFTP/FTP
    "notepadplusplus", # محرر نصوص متقدم
    "git",             # للتحكم في البرمجيات وتنزيل المستودعات
    "vcredist-all",    # حزم Visual C++ الأساسية لتشغيل معظم البرامج بدون أخطاء dll
    "curl",            # أداة التنزيل من سطر الأوامر
    "speedtest-cli"    # لفحص سرعة الإنترنت
)

Write-Host "[2/5] جاري تثبيت البرامج واللوازم الأساسية..." -ForegroundColor Yellow
foreach ($app in $essentialApps) {
    Write-Host "-> جاري تثبيت: $app" -ForegroundColor Gray
    & choco install $app -y --no-progress | Out-Null
}

# 4. تحسين أداء Windows 11 وتقليل استهلاك المعالج والرام على الـ VPS
Write-Host "[3/5] تحسين أداء Windows 11 وتخفيف استهلاك الموارد..." -ForegroundColor Yellow

# تعطيل التأثيرات البصرية البطيئة (Animations / Visual Effects)
Set-ItemProperty -Path 'HKCU:\Control Panel\Desktop' -Name 'UserPreferencesMask' -Value ([byte[]](0x90,0x12,0x03,0x80,0x10,0x00,0x00,0x00)) -ErrorAction SilentlyContinue
Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\VisualEffects' -Name 'VisualFXSetting' -Value 2 -ErrorAction SilentlyContinue

# منع وضع السكون وتوفير الطاقة لضمان بقاء السيرفر شغال 24/7
powercfg /change standby-timeout-ac 0
powercfg /change monitor-timeout-ac 0
powercfg /change hibernate-timeout-ac 0

# 5. ضبط وتحصين إعدادات سطح المكتب البعيد (RDP) ومشاركة الملفات
Write-Host "[4/5] ضبط إعدادات سطح المكتب البعيد (RDP)..." -ForegroundColor Yellow

# تمكين الاتصال بسطح المكتب البعيد RDP
Set-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\Terminal Server' -Name "fDenyTSConnections" -Value 0
Enable-NetFirewallRule -DisplayGroup "Remote Desktop"

# السماح بنسخ الملفات ومشاركة الأقراص عبر RDP
Set-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' -Name "fDisableClip" -Value 0
Set-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' -Name "fDisableCdm" -Value 0

# 6. فحص سرعة الإنترنت الحالية
Write-Host "[5/5] فحص سرعة اتصال السيرفر بالإنترنت..." -ForegroundColor Yellow
if (Get-Command speedtest -ErrorAction SilentlyContinue) {
    speedtest
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  تم الانتهاء بنجاح! السيرفر الآن مجهز بالكامل وجاهز للاستخدام." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
