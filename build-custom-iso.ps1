<#
.SYNOPSIS
    سكربت تجهيز وتعديل نسخة Windows 11 ISO مخصصة للسيرفرات السحابية (Cloud VPS)
.DESCRIPTION
    1. يقرأ بياناتك من config.json ويحدّث ملف التثبيت التلقائي autounattend.xml
    2. يقوم بتنزيل تعريفات السيرفرات السحابية الرسمية (VirtIO Drivers) لحل مشكلة عدم العثور على الأقراص والشبكة
    3. يدمج ملف التثبيت التلقائي بحيث يتخطى متطلبات TPM 2.0 ويقوم بتثبيت النظام وتشغيل RDP فوراً
#>

param(
    [string]$SourceIsoPath = "",
    [string]$OutputIsoPath = ".\Windows11-VPS-Custom.iso"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      أداة تجهيز نسخة Windows 11 الخاصة بالرفع على VPS     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. قراءة الإعدادات من config.json
if (-not (Test-Path ".\config.json")) {
    Write-Error "الملف config.json غير موجود!"
    Exit
}

$config = Get-Content ".\config.json" | ConvertFrom-Json
Write-Host "[1/4] تم تحميل إعدادات السيرفر:" -ForegroundColor Yellow
Write-Host "  - اسم المستخدم: $($config.admin_username)" -ForegroundColor Gray
Write-Host "  - اسم السيرفر:   $($config.computer_name)" -ForegroundColor Gray
Write-Host "  - كلمة المرور:  $($config.admin_password)" -ForegroundColor Gray

# 2. تحديث autounattend.xml بكلمة المرور واسم السيرفر المختار
$xmlContent = Get-Content ".\autounattend.xml" -Raw
$xmlContent = $xmlContent -replace '<Value>.*?</Value>', "<Value>$($config.admin_password)</Value>"
$xmlContent = $xmlContent -replace '<ComputerName>.*?</ComputerName>', "<ComputerName>$($config.computer_name)</ComputerName>"
Set-Content -Path ".\autounattend.xml" -Value $xmlContent -Encoding UTF8
Write-Host "[2/4] تم تحديث ملف التثبيت التلقائي autounattend.xml بنجاح." -ForegroundColor Green

# 3. تنزيل حزمة تعريفات السيرفرات السحابية (VirtIO Drivers)
$virtioDir = ".\virtio-drivers"
if (-not (Test-Path $virtioDir)) {
    New-Item -ItemType Directory -Path $virtioDir | Out-Null
}

$virtioIsoUrl = "https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/stable-virtio/virtio-win.iso"
$virtioIsoPath = "$virtioDir\virtio-win.iso"

if (-not (Test-Path $virtioIsoPath)) {
    Write-Host "[3/4] جاري تنزيل تعريفات السيرفرات السحابية (VirtIO Drivers)..." -ForegroundColor Yellow
    Write-Host "      هذه التعريفات ضرورية للتعرف على القرص الصلب وكرت الشبكة في الـ VPS" -ForegroundColor Gray
    curl.exe -L -o $virtioIsoPath $virtioIsoUrl
    Write-Host "      تم تنزيل التعريفات بنجاح." -ForegroundColor Green
} else {
    Write-Host "[3/4] ملف تعريفات VirtIO موجود مسبقاً." -ForegroundColor Green
}

# 4. إرشادات الدمج النهائي
Write-Host "[4/4] ملفات النظام الخاص بك جاهزة الآن في المجلد:" -ForegroundColor Green
Write-Host "  1. [autounattend.xml] -> يتكفل بالتثبيت التلقائي وتفعيل RDP وتجاوز فحص TPM" -ForegroundColor White
Write-Host "  2. [virtio-win.iso]    -> تعريفات التخزين والشبكة السحابية" -ForegroundColor White
Write-Host "  3. [setup-win11-vps.ps1] -> سكربت تجهيز البرامج الأساسية وتسريع النظام" -ForegroundColor White

Write-Host "`nكيفية الاستخدام مع مزود الاستضافة:" -ForegroundColor Cyan
Write-Host " - في حال طلبت الاستضافة رابط ISO مباشر (مثل Vultr أو Kamatera):" -ForegroundColor Gray
Write-Host "   يمكنك وضع autounattend.xml داخل جذر الـ ISO أو إرفاق قرص التعريفات VirtIO أثناء التثبيت." -ForegroundColor Gray
Write-Host " - أو استخدام سكربت التثبيت السريع عبر Rescue Mode المرفق [install-vps-direct.sh]." -ForegroundColor Gray
