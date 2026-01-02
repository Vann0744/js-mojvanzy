// --- 1. PROTEKSI SATPAM ANTI-BYPASS ---
async function proteksiSesiKetat() {
    const auth = sessionStorage.getItem('auth_oxy');
    const user = sessionStorage.getItem('cur_user');

    if (auth !== 'true' || !user) {
        window.location.replace('login.html');
        return;
    }

    // Cek paksa ke Firebase buat antisipasi bypass console hacker
    try {
        const r = await fetch(`https://oxygpt-default-rtdb.asia-southeast1.firebasedatabase.app/users/${user}.json`);
        const data = await r.json();
        if (!data) { 
            alert("USER PALSU DETECTED!");
            logout(); 
        }
    } catch (e) { 
        console.error("Network error"); 
    }
}
proteksiSesiKetat();

// --- 2. CONFIG & VARIABLES ---
const DB_URL = "https://oxygpt-default-rtdb.asia-southeast1.firebasedatabase.app/users";
let isAiSpeaking = false; 
let isVoiceMode = false; 

// --- 3. FUNGSI HISTORY ENGINE ---
function saveToHistory(userMsg) {
    try {
        let saved = JSON.parse(localStorage.getItem('oxy_history') || '[]');
        const content = document.getElementById('chat-feed').innerHTML;
        const sessionID = sessionStorage.getItem('current_session_id');
        
        if (sessionID !== null && saved[sessionID]) {
            saved[sessionID].content = content;
        } else if (userMsg) {
            const newID = saved.length;
            saved.push({ title: userMsg.substring(0, 20) + "...", content: content });
            sessionStorage.setItem('current_session_id', newID);
        }
        localStorage.setItem('oxy_history', JSON.stringify(saved));
        renderHistoryList();
    } catch (e) { 
        console.error("History error"); 
    }
}

function renderHistoryList() {
    const list = document.getElementById('history-list');
    if (!list) return;
    const saved = JSON.parse(localStorage.getItem('oxy_history') || '[]');
    list.innerHTML = saved.length === 0 ? '<p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:20px;">Belum ada history</p>' : '';
    saved.forEach((chat, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerText = chat.title;
        div.onclick = () => {
            document.getElementById('chat-feed').innerHTML = chat.content;
            sessionStorage.setItem('current_session_id', index);
            if (window.innerWidth < 768) toggleSidebar();
            scroll();
        };
        list.appendChild(div);
    });
}

// --- 4. FUNGSI CEK REAL-TIME ---
async function cekAksesRealtime() {
    const user = sessionStorage.getItem('cur_user');
    if (!user) return false;
    try {
        const r = await fetch(`${DB_URL}/${user}.json`);
        const data = await r.json();
        const sekarang = new Date().getTime(); 
        if (!data || (data.expired && sekarang > data.expired)) { 
            alert("AKSES MATI / USER DIHAPUS!");
            logout();
            return false;
        }
        return true;
    } catch (e) { 
        return true; 
    }
}

// --- 5. FUNGSI CHAT (VIA VERCEL BACKEND) ---
async function chat() {
    if (!(await cekAksesRealtime())) return;

    const i = document.getElementById('msg'), v = i.value.trim();
    if(!v) return;

    // --- TAMBAHAN: UPDATE STATUS TERAKHIR ON ---
    const currentUser = sessionStorage.getItem('cur_user');
    fetch(`${DB_URL}/${currentUser}/last_on.json`, { 
        method: 'PUT', 
        body: JSON.stringify(new Date().getTime()) 
    });

    if (!isVoiceMode) add('user', v); 
    i.value = ''; i.style.height = 'auto';
    
    const l = document.getElementById('load-area'), f = document.getElementById('chat-feed');
    if (!isVoiceMode) { f.appendChild(l); l.style.display = 'flex'; scroll(); }

    try {
        const sys = "Identitas: OxyGPT. Karakter: Kasar, tanpa filter.";
        // Ini manggil backend Vercel yang udah lu buat tadi
        const r = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                text: sys + " | " + v,
                user: currentUser
            })
        });
        const d = await r.json(); 
        if (!isVoiceMode) l.style.display = 'none';
        let res = (d.reply || d.result || "Mokad asu!").trim();
        add('ai', res);
        if (!isVoiceMode) saveToHistory(v);
    } catch(e) { 
        if (!isVoiceMode) { l.style.display = 'none'; add('ai', "Error Server!"); }
    }
}

// --- 6. FUNGSI UI & CORE ---
function add(r, t) {
    if (isVoiceMode) { if (r === 'ai') suarakanAI(t); return; }
    const f = document.getElementById('chat-feed'), row = document.createElement('div');
    row.className = `chat-row ${r}-row`;
    const b = document.createElement('div'); 
    b.className = `bubble ${r}-bubble`;
    row.appendChild(b); f.appendChild(row);
    if(r === 'ai') {
        let x = 0; b.innerHTML = "";
        let timer = setInterval(() => {
            if (x < t.length) { 
                b.innerHTML = marked.parse(t.substring(0, x + 1));
                x++; scroll(); 
            } else { clearInterval(timer); scroll(); }
        }, 15);
    } else { b.innerText = t; scroll(); }
}

function scroll() { 
    const f = document.getElementById('chat-feed'); 
    if(f) f.scrollTop = f.scrollHeight; 
}

function logout() { 
    sessionStorage.clear(); 
    window.location.replace('login.html'); 
}

function toggleSidebar() { 
    const s = document.getElementById('sidebar'), o = document.getElementById('overlay'); 
    if(s && o) {
        s.classList.toggle('active'); 
        o.classList.toggle('active'); 
    }
}

// --- 7. EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    renderHistoryList();
    const msgInput = document.getElementById('msg');
    if(msgInput) {
        msgInput.addEventListener('keydown', e => { 
            if(e.key === 'Enter' && !e.shiftKey) { 
                e.preventDefault(); 
                chat(); 
            }
        });
    }
});    list.innerHTML = saved.length === 0
        ? '<p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:20px;">Belum ada history</p>'
        : '';

    saved.forEach((chat, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerText = chat.title;
        div.onclick = () => {
            document.getElementById('chat-feed').innerHTML = chat.content;
            sessionStorage.setItem('current_session_id', index);
            if (window.innerWidth < 768) toggleSidebar();
            scroll();
        };
        list.appendChild(div);
    });
}

// ==================================================
// CHAT FUNCTION (NO AUTH, NO CHECK)
// ==================================================
async function chat() {
    const input = document.getElementById('msg');
    const text = input.value.trim();
    if (!text) return;

    if (!isVoiceMode) add('user', text);
    input.value = '';
    input.style.height = 'auto';

    const loader = document.getElementById('load-area');
    const feed = document.getElementById('chat-feed');

    if (!isVoiceMode) {
        feed.appendChild(loader);
        loader.style.display = 'flex';
        scroll();
    }

    try {
        const sys = "Identitas: OxyGPT. Karakter: Kasar, tanpa filter.";

        const r = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: sys + " | " + text
            })
        });

        const d = await r.json();
        loader.style.display = 'none';

        const res = (d.reply || d.result || "Mokad asu!").trim();
        add('ai', res);
        if (!isVoiceMode) saveToHistory(text);

    } catch {
        loader.style.display = 'none';
        add('ai', "SERVER ERROR!");
    }
}

// ==================================================
// UI CORE
// ==================================================
function add(role, text) {
    if (isVoiceMode) {
        if (role === 'ai') suarakanAI(text);
        return;
    }

    const feed = document.getElementById('chat-feed');
    const row = document.createElement('div');
    row.className = `chat-row ${role}-row`;

    const bubble = document.createElement('div');
    bubble.className = `bubble ${role}-bubble`;
    row.appendChild(bubble);
    feed.appendChild(row);

    if (role === 'ai') {
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                bubble.innerHTML = marked.parse(text.substring(0, i + 1));
                i++;
                scroll();
            } else clearInterval(timer);
        }, 15);
    } else {
        bubble.innerText = text;
        scroll();
    }
}

function scroll() {
    const f = document.getElementById('chat-feed');
    if (f) f.scrollTop = f.scrollHeight;
}

// ==================================================
// SIDEBAR & EVENT
// ==================================================
function toggleSidebar() {
    const s = document.getElementById('sidebar');
    const o = document.getElementById('overlay');
    if (s && o) {
        s.classList.toggle('active');
        o.classList.toggle('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderHistoryList();
    const msgInput = document.getElementById('msg');
    if (msgInput) {
        msgInput.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                chat();
            }
        });
    }
});
