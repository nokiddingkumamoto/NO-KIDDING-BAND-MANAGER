const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const defaults=[
{id:1,type:'studio',date:'2026-07-20',time:'20:00',title:'スタジオ練習',place:'熊本市内スタジオ'},
{id:2,type:'live',date:'2026-09-22',time:'',title:'九州スカフェス',place:'場所未定'},
{id:3,type:'live',date:'2026-10-11',time:'OPEN 18:00 / START 19:00',title:'福岡CBライブ',place:'福岡CB'}];
let schedules=JSON.parse(localStorage.getItem('nkbSchedules')||'null')||defaults;
let merch=JSON.parse(localStorage.getItem('nkbMerch')||'[]');
const typeName={studio:'スタジオ',live:'ライブ',meeting:'会議'}, colors={studio:'#10c7e8',live:'#f71969',meeting:'#ffd018'};
function save(){localStorage.setItem('nkbSchedules',JSON.stringify(schedules));localStorage.setItem('nkbMerch',JSON.stringify(merch))}
function jpDate(d){const x=new Date(d+'T00:00:00'), w='日月火水木金土'[x.getDay()];return {md:`${x.getMonth()+1}/${x.getDate()}`,w:`(${w})`}}
function card(s){const d=jpDate(s.date), accent=colors[s.type]||'#ffd018';return `<article class="schedule-card" style="--accent:${accent}"><div class="date-box"><b>${d.md}</b><span>${d.w}</span></div><div class="event-box"><div class="event-top"><span class="tag">${typeName[s.type]||'その他'}</span><h3>${s.title}</h3></div><div class="event-meta">${s.time||'時間未定'} <span class="pin">●</span> ${s.place||'場所未定'}</div></div><span class="chev">›</span></article>`}
function render(){const sorted=[...schedules].sort((a,b)=>a.date.localeCompare(b.date));$('#homeSchedules').innerHTML=sorted.slice(0,3).map(card).join('');$('#scheduleList').innerHTML=sorted.map(card).join('');$('#merchList').innerHTML=merch.length?merch.map(x=>`<div class="simple-item"><h3>${x.name} ${x.variant||''}</h3><p>在庫 ${x.stock} ／ ¥${Number(x.price).toLocaleString()}</p></div>`).join(''):'<div class="simple-item"><h3>商品はまだありません</h3><p>右上の＋から追加できます。</p></div>';$('#itemCount').textContent=merch.length;$('#stockTotal').textContent=merch.reduce((a,x)=>a+Number(x.stock),0);$('#stockValue').textContent='¥'+merch.reduce((a,x)=>a+Number(x.stock)*Number(x.price),0).toLocaleString();$('#pollList').innerHTML='<div class="simple-item"><h3>次回スタジオ候補日</h3><p>メンバーの日程調整機能をここに追加できます。</p></div>'}
function page(id){$$('.page').forEach(x=>x.classList.toggle('active',x.id===id));window.scrollTo(0,0);closeDrawer()}
$$('[data-page]').forEach(b=>b.onclick=()=>page(b.dataset.page));
function openDrawer(){$('#drawer').classList.add('open');$('#drawer').setAttribute('aria-hidden','false');$('#overlay').hidden=false}function closeDrawer(){$('#drawer').classList.remove('open');$('#drawer').setAttribute('aria-hidden','true');$('#overlay').hidden=true}
$('#menuBtn').onclick=openDrawer;$('#closeMenu').onclick=closeDrawer;$('#overlay').onclick=closeDrawer;
function openSchedule(){const now=new Date();$('#sDate').value=now.toISOString().slice(0,10);$('#scheduleDialog').showModal()}
$('#quickAdd').onclick=openSchedule;$('#addScheduleHome').onclick=openSchedule;$('#addSchedule').onclick=openSchedule;
$('#scheduleForm').onsubmit=e=>{e.preventDefault();schedules.push({id:Date.now(),type:$('#sType').value,title:$('#sTitle').value,date:$('#sDate').value,time:$('#sTime').value,place:$('#sPlace').value});save();render();$('#scheduleDialog').close();e.target.reset()};
$('#addMerch').onclick=()=>$('#merchDialog').showModal();$('#merchForm').onsubmit=e=>{e.preventDefault();merch.push({id:Date.now(),name:$('#mName').value,variant:$('#mVariant').value,stock:$('#mStock').value,price:$('#mPrice').value});save();render();$('#merchDialog').close();e.target.reset()};
$$('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});render();
