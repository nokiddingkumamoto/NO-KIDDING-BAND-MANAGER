(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const scheduleKey = 'nkbm-v600-schedules';
  const merchKey = 'nkbm-v600-merch';
  const defaultSchedules = [
    {id:'s1',type:'studio',title:'スタジオ練習',date:'2026-07-20',time:'20:00',place:'熊本市内スタジオ'},
    {id:'s2',type:'live',title:'九州スカフェス',date:'2026-09-22',time:'時間未定',place:'場所未定'},
    {id:'s3',type:'live',title:'福岡CBライブ',date:'2026-10-11',time:'OPEN 18:00 / START 19:00',place:'福岡CB',yellow:true}
  ];
  let schedules = load(scheduleKey, defaultSchedules);
  let merch = load(merchKey, []);
  let editingId = null;

  function load(key, fallback){try{const v=JSON.parse(localStorage.getItem(key));return Array.isArray(v)?v:fallback}catch{return fallback}}
  function save(){localStorage.setItem(scheduleKey,JSON.stringify(schedules));localStorage.setItem(merchKey,JSON.stringify(merch))}
  function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function weekday(date){return ['日','月','火','水','木','金','土'][new Date(date+'T00:00:00').getDay()]}
  function md(date){const d=new Date(date+'T00:00:00');return `${d.getMonth()+1}/${d.getDate()}`}
  function typeLabel(type){return type==='studio'?'スタジオ':'ライブ'}
  function card(item){const classes=['schedule-card',item.type==='studio'?'studio':'',item.yellow?'live-yellow':''].filter(Boolean).join(' ');return `<button class="${classes}" data-edit="${item.id}"><span class="date-box"><b>${md(item.date)}</b><span>(${weekday(item.date)})</span></span><span class="event-box"><span class="event-top"><span class="tag">${typeLabel(item.type)}</span><h3>${esc(item.title)}</h3></span><span class="event-meta"><span>${esc(item.time||'時間未定')}</span><span class="place"><i class="pin">●</i>${esc(item.place||'場所未定')}</span></span></span><span class="chev">›</span></button>`}
  function renderSchedules(){schedules.sort((a,b)=>a.date.localeCompare(b.date));$('#homeSchedules').innerHTML=schedules.slice(0,3).map(card).join('');$('#scheduleList').innerHTML=schedules.map(card).join('');$$('[data-edit]').forEach(b=>b.onclick=()=>openSchedule(b.dataset.edit));updateCountdowns()}
  function updateCountdowns(){const today=new Date();today.setHours(0,0,0,0);const days=(x)=>Math.max(0,Math.ceil((new Date(x.date+'T00:00:00')-today)/86400000));const studio=schedules.filter(x=>x.type==='studio'&&new Date(x.date+'T00:00:00')>=today)[0];const live=schedules.filter(x=>x.type==='live'&&new Date(x.date+'T00:00:00')>=today)[0];$('#nextStudioDays').innerHTML=(studio?days(studio):0)+'<span>日</span>';$('#nextLiveDays').innerHTML=(live?days(live):0)+'<span>日</span>'}
  function renderMerch(){const total=merch.reduce((s,x)=>s+Number(x.stock||0),0);const value=merch.reduce((s,x)=>s+Number(x.stock||0)*Number(x.price||0),0);$('#itemCount').textContent=merch.length;$('#stockTotal').textContent=total;$('#stockValue').textContent='¥'+value.toLocaleString('ja-JP');$('#merchList').innerHTML=merch.length?merch.map(x=>`<div class="simple-item"><span><b>${esc(x.name)}</b><small>${esc(x.variant||'')}</small></span><span>在庫 ${x.stock}<br>¥${Number(x.price).toLocaleString('ja-JP')}</span></div>`).join(''):'<div class="empty-panel">商品はまだ登録されていません。</div>';$('#stockItem').innerHTML=merch.map((x,i)=>`<option value="${i}">${esc(x.name)} ${esc(x.variant||'')}</option>`).join('')}
  function showPage(id){$$('.page').forEach(p=>p.classList.toggle('active',p.id===id));closeDrawer();window.scrollTo({top:0,behavior:'smooth'})}
  $$('[data-page]').forEach(b=>b.onclick=()=>showPage(b.dataset.page));
  function openDrawer(){$('#drawer').classList.add('open');$('#overlay').hidden=false;$('#drawer').setAttribute('aria-hidden','false')}
  function closeDrawer(){$('#drawer').classList.remove('open');$('#overlay').hidden=true;$('#drawer').setAttribute('aria-hidden','true')}
  $('#menuBtn').onclick=openDrawer;$('#closeMenu').onclick=closeDrawer;$('#overlay').onclick=closeDrawer;
  $$('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
  $('#quickAdd').onclick=()=>$('#quickAddDialog').showModal();
  $('#quickScheduleAction').onclick=()=>{$('#quickAddDialog').close();openSchedule()};
  $('#quickProductAction').onclick=()=>{$('#quickAddDialog').close();$('#merchDialog').showModal()};
  $('#quickStockAction').onclick=()=>{$('#quickAddDialog').close();renderMerch();$('#stockDialog').showModal()};
  $('#addSchedule').onclick=()=>openSchedule();
  $('#addMerch').onclick=()=>$('#merchDialog').showModal();
  function openSchedule(id=null){editingId=id;const x=schedules.find(v=>v.id===id);$('#scheduleDialogTitle').textContent=x?'スケジュールを編集':'スケジュールを追加';$('#sType').value=x?.type||'studio';$('#sTitle').value=x?.title||'';$('#sDate').value=x?.date||'';$('#sTime').value=x?.time||'';$('#sPlace').value=x?.place||'';$('#deleteSchedule').hidden=!x;$('#scheduleDialog').showModal()}
  $('#scheduleForm').onsubmit=(e)=>{e.preventDefault();const item={id:editingId||crypto.randomUUID(),type:$('#sType').value,title:$('#sTitle').value.trim(),date:$('#sDate').value,time:$('#sTime').value.trim()||'時間未定',place:$('#sPlace').value.trim()||'場所未定'};if(editingId){schedules=schedules.map(x=>x.id===editingId?item:x)}else{schedules.push(item)}save();renderSchedules();$('#scheduleDialog').close()}
  $('#deleteSchedule').onclick=()=>{if(editingId&&confirm('このスケジュールを削除しますか？')){schedules=schedules.filter(x=>x.id!==editingId);save();renderSchedules();$('#scheduleDialog').close()}}
  $('#merchForm').onsubmit=(e)=>{e.preventDefault();merch.push({name:$('#mName').value.trim(),variant:$('#mVariant').value.trim(),stock:Number($('#mStock').value),price:Number($('#mPrice').value)});save();renderMerch();e.target.reset();$('#merchDialog').close()}
  $('#stockForm').onsubmit=(e)=>{e.preventDefault();const i=Number($('#stockItem').value);if(merch[i])merch[i].stock=Math.max(0,Number(merch[i].stock)+Number($('#stockChange').value));save();renderMerch();e.target.reset();$('#stockDialog').close()}
  if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js?v=600').catch(()=>{});
  renderSchedules();renderMerch();
})();
