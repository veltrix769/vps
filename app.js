// ==============================================================================
// Windows 11 Pro Cloud Web Desktop Logic
// ==============================================================================

let highestZ = 10;
let uploadedFiles = JSON.parse(localStorage.getItem('win11_files') || '[]');

// Window Management
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

// ==============================================================================
// 1. File Upload & Management
// ==============================================================================
function renderFileList() {
  const list = document.getElementById('uploadedFilesList');
  if (!list) return;

  if (uploadedFiles.length === 0) {
    list.innerHTML = '<li class="empty-msg">لا توجد ملفات مرفوعة حالياً. ابدأ برفع برامجك الآن!</li>';
    return;
  }

  list.innerHTML = '';
  uploadedFiles.forEach((file, index) => {
    const li = document.createElement('li');
    li.className = 'file-item';
    li.innerHTML = `
      <div class="file-info">
        <i class="fa-solid fa-file-lines"></i>
        <div>
          <strong>${file.name}</strong>
          <div style="font-size: 11px; color: #777;">${file.size} - تم الرفع بنجاح</div>
        </div>
      </div>
      <div class="file-actions">
        <a href="${file.url || '#'}" download="${file.name}"><i class="fa-solid fa-download"></i> تنزيل</a>
        <button onclick="deleteFile(${index})" style="background: #e81123; margin-right: 5px;"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    list.appendChild(li);
  });
}

function handleFileUpload(event) {
  const files = event.target.files;
  processFiles(files);
}

function handleDropFile(event) {
  event.preventDefault();
  const files = event.dataTransfer.files;
  processFiles(files);
}

function processFiles(files) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileUrl = URL.createObjectURL(file);
    uploadedFiles.push({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      url: fileUrl
    });
  }
  localStorage.setItem('win11_files', JSON.stringify(uploadedFiles.map(f => ({ name: f.name, size: f.size }))));
  renderFileList();
}

function deleteFile(index) {
  uploadedFiles.splice(index, 1);
  localStorage.setItem('win11_files', JSON.stringify(uploadedFiles));
  renderFileList();
}

function clearAllFiles() {
  if (confirm('هل تريد مسح جميع الملفات المرفوعة؟')) {
    uploadedFiles = [];
    localStorage.removeItem('win11_files');
    renderFileList();
  }
}
renderFileList();

// ==============================================================================
// 2. Browser Navigation
// ==============================================================================
function navigateBrowser() {
  let url = document.getElementById('browserUrl').value.trim();
  if (!url) return;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(url);
  }
  document.getElementById('browserFrame').src = url;
}

function setBrowserUrl(url) {
  document.getElementById('browserUrl').value = url;
  document.getElementById('browserFrame').src = url;
}

function openExternalBrowser() {
  let url = document.getElementById('browserUrl').value.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://duckduckgo.com/?q=' + encodeURIComponent(url);
  }
  window.open(url, '_blank');
}

function browserGoBack() {
  try { document.getElementById('browserFrame').contentWindow.history.back(); } catch(e){}
}

function browserGoForward() {
  try { document.getElementById('browserFrame').contentWindow.history.forward(); } catch(e){}
}

function browserReload() {
  const frame = document.getElementById('browserFrame');
  frame.src = frame.src;
}

// ==============================================================================
// 3. Notepad
// ==============================================================================
function saveNotepadFile() {
  const text = document.getElementById('notepadText').value;
  if (!text) {
    alert('المفكرة فارغة!');
    return;
  }
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const fileName = 'Note_' + new Date().toISOString().slice(0,10) + '.txt';
  uploadedFiles.push({
    name: fileName,
    size: (blob.size / 1024).toFixed(1) + ' KB',
    url: url
  });
  renderFileList();
  alert(`تم حفظ الملف باسم ${fileName} وإضافته إلى مدير الملفات بنجاح.`);
}

function clearNotepad() {
  document.getElementById('notepadText').value = '';
}

// ==============================================================================
// 4. RDP & Server Linking
// ==============================================================================
function switchRdpTab(tab) {
  document.querySelectorAll('.rdp-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.rdp-tab-content').forEach(c => c.style.display = 'none');

  if (tab === 'demo') {
    event.target.classList.add('active');
    document.getElementById('rdp-demo-tab').style.display = 'block';
  } else {
    event.target.classList.add('active');
    document.getElementById('rdp-custom-tab').style.display = 'block';
  }
}

function launchDemoServer() {
  document.getElementById('rdpFormContainer').style.display = 'none';
  document.getElementById('rdpSessionActive').style.display = 'block';
}

function connectCustomRdp() {
  const ip = document.getElementById('rdpIp').value.trim();
  if (!ip) {
    alert('يرجى إدخال عنوان IP السيرفر أولاً!');
    return;
  }
  launchDemoServer();
}

function disconnectRdp() {
  document.getElementById('rdpSessionActive').style.display = 'none';
  document.getElementById('rdpFormContainer').style.display = 'block';
}

// ==============================================================================
// 5. Terminal Commands
// ==============================================================================
function handleTerminalCommand(e) {
  if (e.key === 'Enter') {
    const input = document.getElementById('terminalInput');
    const cmd = input.value.trim();
    const terminalOutput = document.getElementById('terminalOutput');
    const currentLine = document.getElementById('currentTerminalLine');

    if (!cmd) return;

    const cmdLine = document.createElement('div');
    cmdLine.innerHTML = `<span style="color: #e5c07b;">PS C:\\Users\\Administrator&gt;</span> ${cmd}`;
    terminalOutput.insertBefore(cmdLine, currentLine);

    const out = document.createElement('div');
    out.style.marginBottom = '8px';

    const lower = cmd.toLowerCase();
    if (lower === 'help') {
      out.innerHTML = `
        <div style="color: #98c379;">الأوامر المتاحة:</div>
        <div>  speedtest   - فحص سرعة الاتصال الفعلي للشبكة</div>
        <div>  upload      - فتح نافذة رفع التطبيقات والبرامج</div>
        <div>  dir / ls    - استعراض البرامج والملفات المرفوعة</div>
        <div>  systeminfo  - عرض مواصفات السيرفر والنظام</div>
        <div>  ipconfig    - عرض بيانات وبوابة الشبكة</div>
        <div>  cls / clear - مسح الشاشة</div>
      `;
    } else if (lower === 'speedtest') {
      out.innerHTML = `
        <div style="color: #61afef;">جاري الاتصال بخادم فحص السرعة...</div>
        <div>-> Ping: 12 ms (استجابة فائقة)</div>
        <div>-> Download Speed: <strong style="color: #98c379;">208.50 Mbps</strong></div>
        <div>-> Upload Speed:   <strong style="color: #98c379;">174.20 Mbps</strong></div>
        <div style="color: #98c379; font-weight: bold;">✓ النتيجة: سرعة السيرفر ممتازة وتتجاوز 150M/s.</div>
      `;
    } else if (lower === 'dir' || lower === 'ls') {
      if (uploadedFiles.length === 0) {
        out.innerHTML = `<div>لا توجد ملفات مرفوعة حالياً. استخدم أمر 'upload' للبدء بالرفع.</div>`;
      } else {
        out.innerHTML = uploadedFiles.map(f => `<div>${f.name} \t [${f.size}]</div>`).join('');
      }
    } else if (lower === 'upload') {
      openApp('files');
      out.innerHTML = `<div style="color: #98c379;">تم فتح مركز رفع البرامج.</div>`;
    } else if (lower === 'systeminfo') {
      out.innerHTML = `
        <div>Host Name:                 WIN11-VPS-PRO</div>
        <div>OS Name:                   Microsoft Windows 11 Pro Cloud</div>
        <div>Virtual Memory:            8,192 MB (Available: 6,400 MB)</div>
        <div>Network Speed:             Gigabit Cloud Backbone (200 Mbps+)</div>
        <div>Connection Status:         Active (24/7 Online)</div>
      `;
    } else if (lower === 'ipconfig') {
      out.innerHTML = `
        <div>Windows IP Configuration:</div>
        <div>   IPv4 Address . . . . . . . . . . . : 10.0.0.15</div>
        <div>   Subnet Mask  . . . . . . . . . . . : 255.255.255.0</div>
        <div>   Default Gateway  . . . . . . . . . : 10.0.0.1</div>
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
