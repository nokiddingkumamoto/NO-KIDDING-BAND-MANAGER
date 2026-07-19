const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const defaults = [
  { id: 1, type: 'studio', date: '2026-07-20', time: '20:00', title: 'スタジオ練習', place: '熊本市内スタジオ' },
  { id: 2, type: 'live', date: '2026-09-22', time: '', title: '九州スカフェス', place: '場所未定' },
  { id: 3, type: 'live', date: '2026-10-11', time: 'OPEN 18:00 / START 19:00', title: '福岡CBライブ', place: '福岡CB' }
];

let schedules = JSON.parse(localStorage.getItem('nkbSchedules') || 'null') || defaults;
let merch = JSON.parse(localStorage.getItem('nkbMerch') || '[]');
let editingScheduleId = null;

const typeName = { studio: 'スタジオ', live: 'ライブ', meeting: 'ミーティング' };
const colors = { studio: '#10c7e8', live: '#f71969', meeting: '#ffd018' };

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
}

function save() {
  localStorage.setItem('nkbSchedules', JSON.stringify(schedules));
  localStorage.setItem('nkbMerch', JSON.stringify(merch));
}

function jpDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const weekday = '日月火水木金土'[date.getDay()];
  return { md: `${date.getMonth() + 1}/${date.getDate()}`, w: `(${weekday})` };
}

function card(schedule) {
  const date = jpDate(schedule.date);
  const accent = colors[schedule.type] || '#ffd018';
  return `
    <button class="schedule-card schedule-open" data-schedule-id="${schedule.id}" style="--accent:${accent}" type="button">
      <div class="date-box"><b>${date.md}</b><span>${date.w}</span></div>
      <div class="event-box">
        <div class="event-top">
          <span class="tag">${escapeHtml(typeName[schedule.type] || 'その他')}</span>
          <h3>${escapeHtml(schedule.title)}</h3>
        </div>
        <div class="event-meta"><span class="event-time">${escapeHtml(schedule.time || '時間未定')}</span><span class="event-place"><span class="pin">●</span>${escapeHtml(schedule.place || '場所未定')}</span></div>
      </div>
      <span class="chev">›</span>
    </button>`;
}

function render() {
  const sorted = [...schedules].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  $('#homeSchedules').innerHTML = sorted.length
    ? sorted.slice(0, 3).map(card).join('')
    : '<div class="empty-state">予定はまだありません。右上の＋から追加できます。</div>';
  $('#scheduleList').innerHTML = sorted.length
    ? sorted.map(card).join('')
    : '<div class="empty-state">確定スケジュールはまだありません。</div>';

  $('#merchList').innerHTML = merch.length
    ? merch.map((item) => `<div class="simple-item"><h3>${escapeHtml(item.name)} ${escapeHtml(item.variant || '')}</h3><p>在庫 ${Number(item.stock)} ／ ¥${Number(item.price).toLocaleString()}</p></div>`).join('')
    : '<div class="simple-item"><h3>商品はまだありません</h3><p>右上の＋から追加できます。</p></div>';

  $('#itemCount').textContent = merch.length;
  $('#stockTotal').textContent = merch.reduce((total, item) => total + Number(item.stock), 0);
  $('#stockValue').textContent = `¥${merch.reduce((total, item) => total + Number(item.stock) * Number(item.price), 0).toLocaleString()}`;
  $('#pollList').innerHTML = '<div class="simple-item"><h3>次回スタジオ候補日</h3><p>次の段階で、メンバーごとの○・△・×回答機能を追加します。</p></div>';

  $$('.schedule-open').forEach((button) => {
    button.addEventListener('click', () => openSchedule(Number(button.dataset.scheduleId)));
  });
}

function page(id) {
  $$('.page').forEach((section) => section.classList.toggle('active', section.id === id));
  window.scrollTo(0, 0);
  closeDrawer();
}

$$('[data-page]').forEach((button) => {
  button.addEventListener('click', () => page(button.dataset.page));
});

function openDrawer() {
  $('#drawer').classList.add('open');
  $('#drawer').setAttribute('aria-hidden', 'false');
  $('#overlay').hidden = false;
}

function closeDrawer() {
  $('#drawer').classList.remove('open');
  $('#drawer').setAttribute('aria-hidden', 'true');
  $('#overlay').hidden = true;
}

$('#menuBtn').addEventListener('click', openDrawer);
$('#closeMenu').addEventListener('click', closeDrawer);
$('#overlay').addEventListener('click', closeDrawer);

function openSchedule(id = null) {
  editingScheduleId = id;
  const dialog = $('#scheduleDialog');
  const form = $('#scheduleForm');
  const deleteButton = $('#deleteSchedule');

  form.reset();
  $('#scheduleDialogTitle').textContent = id ? 'スケジュールを編集' : 'スケジュールを追加';
  deleteButton.hidden = !id;

  if (id) {
    const schedule = schedules.find((item) => Number(item.id) === Number(id));
    if (!schedule) return;
    $('#sType').value = schedule.type;
    $('#sTitle').value = schedule.title;
    $('#sDate').value = schedule.date;
    $('#sTime').value = schedule.time || '';
    $('#sPlace').value = schedule.place || '';
  } else {
    $('#sDate').value = new Date().toISOString().slice(0, 10);
  }

  dialog.showModal();
}

function openMerch() {
  $('#merchDialog').showModal();
}

function openStock() {
  if (!merch.length) {
    alert('先に商品を追加してください。');
    openMerch();
    return;
  }
  $('#stockItem').innerHTML = merch.map((item) => `<option value="${item.id}">${escapeHtml(item.name)}${item.variant ? ` ${escapeHtml(item.variant)}` : ''}（現在 ${Number(item.stock)}）</option>`).join('');
  $('#stockChange').value = '';
  $('#stockDialog').showModal();
}

$('#quickAdd').addEventListener('click', () => $('#quickAddDialog').showModal());
$('#quickScheduleAction').addEventListener('click', () => { $('#quickAddDialog').close(); openSchedule(); });
$('#quickProductAction').addEventListener('click', () => { $('#quickAddDialog').close(); openMerch(); });
$('#quickStockAction').addEventListener('click', () => { $('#quickAddDialog').close(); openStock(); });
$('#addSchedule').addEventListener('click', () => openSchedule());

$('#scheduleForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = {
    id: editingScheduleId || Date.now(),
    type: $('#sType').value,
    title: $('#sTitle').value.trim(),
    date: $('#sDate').value,
    time: $('#sTime').value,
    place: $('#sPlace').value.trim()
  };

  if (editingScheduleId) {
    schedules = schedules.map((item) => Number(item.id) === Number(editingScheduleId) ? data : item);
  } else {
    schedules.push(data);
  }

  save();
  render();
  $('#scheduleDialog').close();
  editingScheduleId = null;
});

$('#deleteSchedule').addEventListener('click', () => {
  if (!editingScheduleId) return;
  const schedule = schedules.find((item) => Number(item.id) === Number(editingScheduleId));
  if (!schedule || !confirm(`「${schedule.title}」を削除しますか？`)) return;
  schedules = schedules.filter((item) => Number(item.id) !== Number(editingScheduleId));
  save();
  render();
  $('#scheduleDialog').close();
  editingScheduleId = null;
});

$('#addMerch').addEventListener('click', openMerch);
$('#merchForm').addEventListener('submit', (event) => {
  event.preventDefault();
  merch.push({
    id: Date.now(),
    name: $('#mName').value.trim(),
    variant: $('#mVariant').value.trim(),
    stock: Number($('#mStock').value),
    price: Number($('#mPrice').value)
  });
  save();
  render();
  $('#merchDialog').close();
  event.target.reset();
});

$('#stockForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const item = merch.find((entry) => String(entry.id) === $('#stockItem').value);
  if (!item) return;
  item.stock = Math.max(0, Number(item.stock) + Number($('#stockChange').value));
  save();
  render();
  $('#stockDialog').close();
});

$$('[data-close]').forEach((button) => {
  button.addEventListener('click', () => {
    button.closest('dialog').close();
    editingScheduleId = null;
  });
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

render();
