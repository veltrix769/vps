# نظام Windows 11 مخصص للرفع على خوادم الاستضافة (VPS)

تم تجهيز جميع الملفات والأدوات اللازمة لبناء وتخصيص نظام **Windows 11 خاص بك بالكامل**، مع تجاوز متطلبات العتاد (TPM / Secure Boot)، وإدراج تعريفات السيرفرات السحابية (VirtIO Drivers)، وتفعيل الاتصال ونقل الملفات تلقائياً.

---

## فهرس الملفات المجهزة لك

1. [config.json](file:///c:/Users/musta/OneDrive/Desktop/vps/config.json):
   - ملف الإعدادات الخاصة بك (ضع فيه اسم السيرفر، اسم المستخدم، وكلمة المرور التي تريدها).

2. [autounattend.xml](file:///c:/Users/musta/OneDrive/Desktop/vps/autounattend.xml):
   - ملف التثبيت التلقائي الصامت:
     - يتخطى متطلبات TPM 2.0 والذاكرة العشوائية والمعالج.
     - يقسم القرص تلقائياً ويثبت النظام دون الحاجة لأي نقرة بالماوس.
     - يفعّل بروتوكول Remote Desktop (RDP) وجدار الحماية فور انتهاء التثبيت.

3. [build-custom-iso.ps1](file:///c:/Users/musta/OneDrive/Desktop/vps/build-custom-iso.ps1):
   - سكربت باورشيل يقوم بقراءة إعداداتك وتنزيل أحدث حزمة رسمية لتعريفات السيرفرات (VirtIO Drivers) لحل مشكلة عدم التعرف على الأقراص والإنترنت.

4. [install-vps-direct.sh](file:///c:/Users/musta/OneDrive/Desktop/vps/install-vps-direct.sh):
   - سكربت التثبيت السحابي المباشر عبر وضع الإنقاذ (Rescue Mode) لشركات مثل Hetzner و Contabo و OVH.

5. [setup-win11-vps.ps1](file:///c:/Users/musta/OneDrive/Desktop/vps/setup-win11-vps.ps1):
   - لتثبيت كافة اللوازم الأساسية (Chrome, 7-Zip, FileZilla, Visual C++ Runtimes) وتسريع أداء السيرفر بضغطة زر.

6. [docker-compose.yml](file:///c:/Users/musta/OneDrive/Desktop/vps/docker-compose.yml):
   - لتشغيل Windows 11 كحاوية سحابية مستقلة على أي سيرفر لينكس بنقرة واحدة مع واجهة متصفح و RDP.

---

## خطوات استخدام وتخصيص النظام لرفعه على الاستضافة

### الخطوة 1: تعديل بياناتك الخاصة
افتح ملف [config.json](file:///c:/Users/musta/OneDrive/Desktop/vps/config.json) وضع كلمة المرور واسم المستخدم الذي ترغب به:
```json
{
  "admin_username": "Administrator",
  "admin_password": "ضع_كلمة_المرور_الخاصة_بك_هنا",
  "computer_name": "MY-WIN11-VPS"
}
```

### الخطوة 2: تشغيل سكربت التجهيز
افتح PowerShell في هذا المجلد وشغّل:
```powershell
.\build-custom-iso.ps1
```
سيقوم السكربت بربط بياناتك مع ملف `autounattend.xml` وتنزيل تعريفات السيرفرات السحابية.

### الخطوة 3: رفع النظام إلى الاستضافة

لديك خياران للرفع بحسب نوع الاستضافة:

* **الخيار الأول (رفع ملف ISO):**
  - في الاستضافات التي تدعم رفع ملفات ISO (مثل Vultr, Kamatera, Proxmox):
  - ارفع ملف ISO المخصص وسيقوم النظام بتثبيت نفسه تلقائياً دون أي تدخل.

* **الخيار الثاني (التثبيت المباشر بنقرة واحدة عبر Rescue Mode):**
  - في استضافات مثل Hetzner أو Contabo:
  - شغّل السيرفر في وضع الإنقاذ (Rescue Mode).
  - اتصل بالسيرفر عبر SSH وشغّل سكربت [install-vps-direct.sh](file:///c:/Users/musta/OneDrive/Desktop/vps/install-vps-direct.sh).
  - سيقوم السكربت بكتابة النظام على القرص مباشرة، وعند إعادة التشغيل يفتح معك Windows 11 فوراً.
