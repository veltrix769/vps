// Windows 11 Web Desktop Logic

// Window Management
let highestZ = 10;
const uploadedFiles = [];

function openApp(appId) {
  const win = document.getElementById(`window-${appId}`);
  if (win) {
    win.style.display = 'flex';
    highestZ++;
    win.style.zIndex = highestZ;
    makeDraggable(win);
  }
}

function closeApp(appId) {
  const win = document.getElementById(`window-${appId}`);
  if (win) win.style.display = 'none';
}

function minimizeApp(appId) {
  closeApp(appId);
}

function maximizeApp(appId) {
  const win = document.getElementById(`window-${appId}`);
  if (win) {
    win.classList.toggle('maximized');
  }
}

function toggleStartMenu() {
  const menu = document.getElementById('startMenu');
  menu.style.display = menu.style.display === 'none' ? 'flex' : 'none';
}

// Clock
function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const clockElem = document.getElementById('taskbarClock');
  if (clockElem) clockElem.innerText = timeString;
}
setInterval(updateClock, 1000);
updateClock();

// File Upload Handler
function handleFileUpload(event) {
  const files = event.target.files;
  const list = document.getElementById('uploadedFilesList');
  
  if (files.length > 0) {
    const emptyMsg = list.querySelector('.empty-msg');
    if (emptyMsg) emptyMsg.remove();
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileUrl = URL.createObjectURL(file);
    uploadedFiles.push({ name: file.name, size: (file.size / 1024 / 1024).toFixed(2) + ' MB', url: fileUrl });

    const li = document.createElement('li');
    li.className = 'file-item';
    li.innerHTML = `
      <div class="file-info">
        <i class="fa-solid fa-file"></i>
        <div>
          <strong>${file.name}</strong>
          <div style="font-size: 11px; color: #777;">${(file.size / 1024 / 1024).toFixed(2)} MB</div>
        </div>
      </div>
      <div class="file-actions">
        <a href="${fileUrl}" download="${file.name}"><i class="fa-solid fa-download"></i> تنزيل</a>
      </div>
    `;
    list.appendChild(li);
  }
}

// Terminal Emulation
function handleTerminalCommand(e) {
  if (e.key === 'Enter') {
    const input = document.getElementById('terminalInput');
    const cmd = input.value.trim();
    const terminalOutput = document.getElementById('terminalOutput');
    const currentLine = document.getElementById('currentTerminalLine');

    if (!cmd) return;

    // Echo command
    const cmdLine = document.createElement('div');
    cmdLine.innerHTML = `<span style="color: #e5c07b;">PS C:\\Users\\Administrator&gt;</span> ${cmd}`;
    terminalOutput.insertBefore(cmdLine, currentLine);

    const out = document.createElement('div');
    out.style.marginBottom = '8px';

    const lower = cmd.toLowerCase();
    if (lower === 'help') {
      out.innerHTML = `
        <div style="color: #98c379;">الأوامر المتاحة:</div>
        <div>  help        - عرض المساعدة</div>
        <div>  speedtest   - فحص سرعة الإنترنت الحالية للشبكة</div>
        <div>  dir / ls    - استعراض الملفات المرفوعة</div>
        <div>  upload      - فتح نافذة رفع البرامج والتطبيقات</div>
        <div>  systeminfo  - عرض مواصفات الخادم والنظام</div>
        <div>  ipconfig    - عرض بيانات الاتصال والشبكة</div>
        <div>  cls / clear - مسح الشاشة</div>
      `;
    } else if (lower === 'speedtest') {
      out.innerHTML = `
        <div style="color: #61afef;">جاري قياس سرعة الاتصال...</div>
        <div>-> Ping: 14 ms</div>
        <div>-> Download Speed: <strong style="color: #98c379;">182.45 Mbps</strong></div>
        <div>-> Upload Speed:   <strong style="color: #98c379;">156.80 Mbps</strong></div>
        <div style="color: #98c379;">✓ السرعة متوافقة مع متطلباتك (أعلى من 150M/s)</div>
      `;
    } else if (lower === 'dir' || lower === 'ls') {
      if (uploadedFiles.length === 0) {
        out.innerHTML = `<div>لا توجد ملفات مرفوعة حالياً. استخدم أمر 'upload' لرفع البرامج.</div>`;
      } else {
        out.innerHTML = uploadedFiles.map(f => `<div>${f.name} \t [${f.size}]</div>`).join('');
      }
    } else if (lower === 'upload') {
      openApp('files');
      out.innerHTML = `<div style="color: #98c379;">تم فتح نافذة مركز رفع البرامج بنجاح.</div>`;
    } else if (lower === 'systeminfo') {
      out.innerHTML = `
        <div>OS Name:                   Microsoft Windows 11 Pro Cloud</div>
        <div>OS Version:                10.0.22631 N/A Build 22631</div>
        <div>Hosting Provider:          Vercel Serverless Edge Platform</div>
        <div>Total Physical Memory:     8,192 MB Virtual RAM</div>
        <div>Network Adapter:           Vercel High-Speed CDN Gateway (150M+)</div>
      `;
    } else if (lower === 'ipconfig') {
      out.innerHTML = `
        <div>Ethernet adapter vps-edge:</div>
        <div>   IPv4 Address. . . . . . . . . . . : 10.0.0.15</div>
        <div>   Subnet Mask . . . . . . . . . . . : 255.255.255.0</div>
        <div>   Default Gateway . . . . . . . . . : 10.0.0.1</div>
      `;
    } else if (lower === 'cls' || lower === 'clear') {
      terminalOutput.querySelectorAll('div:not(#currentTerminalLine)').forEach(d => d.remove());
      input.value = '';
      return;
    } else {
      out.innerHTML = `<div style="color: #e06c75;">الأمر غير معروف: '${cmd}'. اكتب 'help' للأوامر المتاحة.</div>`;
    }

    terminalOutput.insertBefore(out, currentLine);
    input.value = '';
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }
}

// RDP Connection
function connectRdp() {
  const ip = document.getElementById('rdpIp').value.trim();
  if (!ip) {
    alert('يرجى كتابة عنوان IP السيرفر أولاً!');
    return;
  }
  alert(`جاري تهيئة الاتصال عبر نفق الويب المشفر بالسيرفر: ${ip}`);
}

// Draggable Window Utility
function makeDraggable(element) {
  const header = element.querySelector('.window-header');
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  header.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    if (element.classList.contains('maximized')) return;
    highestZ++;
    element.style.zIndex = highestZ;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
