#!/bin/bash
# ==============================================================================
# سكربت التثبيت المباشر لنظام Windows 11 على أي سيرفر سحابي (Rescue Mode)
# يعمل على: Hetzner, Contabo, OVH, Vultr, DigitalOcean, Linode وغيرها
# ==============================================================================

set -e

echo -e "\e[36m==========================================================\e[0m"
echo -e "\e[36m     تثبيت نظام Windows 11 المباشر على السيرفر (VPS)      \e[0m"
echo -e "\e[36m==========================================================\e[0m"

# 1. تحديد قرص السيرفر الرئيسي
MAIN_DISK=$(lsblk -d -n -o NAME,TYPE | grep -E 'disk' | head -n 1 | awk '{print $1}')
if [ -z "$MAIN_DISK" ]; then
    echo -e "\e[31m[خطأ] لم يتم العثور على قرص النظام الرئيسي!\e[0m"
    exit 1
fi
DISK_PATH="/dev/$MAIN_DISK"
echo -e "\e[33m-> تم تحديد القرص المستهدف:\e[0m $DISK_PATH"

# 2. التأكد من توفر الأدوات الأساسية
apt-get update -y && apt-get install -y wget curl gzip pigz

# 3. رابط صورة Windows 11 المجهزة سحابياً بالتعريفات (VirtIO) وتفعيل RDP
# ملاحظة: يمكنك تغيير الرابط إلى صورتك الخاصة أو الرابط السحابي المباشر
IMAGE_URL="https://archive.org/download/win11-vps-virtio/win11_custom_vps.vhd.gz"

echo -e "\e[33m-> جاري كتابة وتثبيت نظام Windows 11 مباشرة إلى القرص...\e[0m"
echo -e "\e[90mقد تستغرق العملية من 5 إلى 10 دقائق بحسب سرعة اتصال السيرفر.\e[0m"

wget -qO- "$IMAGE_URL" | gunzip -c | dd of="$DISK_PATH" bs=4M status=progress conv=fsync

echo -e "\e[32m==========================================================\e[0m"
echo -e "\e[32m  تمت كتابة النظام بنجاح إلى القرص!\e[0m"
echo -e "\e[32m  بيانات تسجيل الدخول الافتراضية:\e[0m"
echo -e "  - المستخدم: Administrator"
echo -e "  - كلمة المرور: Password123#VPS"
echo -e "  - منفذ RDP: 3389"
echo -e "\e[32m==========================================================\e[0m"
echo -e "\e[33mأعد تشغيل السيرفر الآن بالضغط على أمر: reboot\e[0m"
