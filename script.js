// ==================================================
// CONFIG
// ==================================================
let isAiSpeaking = false;
let isVoiceMode = false;

// ==================================================
// HISTORY ENGINE (LOCAL ONLY)
// ==================================================
function saveToHistory(userMsg) {
    try {
        let saved = JSON.parse(localStorage.getItem('oxy_history') || '[]');
        const content = document.getElementById('chat-feed').innerHTML;
        const sessionID = sessionStorage.getItem('current_session_id');

        if (sessionID !== null && saved[sessionID]) {
            saved[sessionID].content = content;
        } else if (userMsg) {
            const newID = saved.length;
            saved.push({
                title: userMsg.substring(0, 20) + "...",
                content
            });
            sessionStorage.setItem('current_session_id', newID);
        }

        localStorage.setItem('oxy_history', JSON.stringify(saved));
        renderHistoryList();
    } catch {}
}

function renderHistoryList() {
    const list = document.getElementById('history-list');
    if (!list) return;

    const saved = JSON.parse(localStorage.getItem('oxy_history') || '[]');
    list.innerHTML = saved.length === 0
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