const $=id=>document.getElementById(id);
const MEMBERS=["YAMA (Vo)","殿 (Gt)","うっちー (Ba)","RYUTO (Dr)","JUN (Tp)","MASTER (Tb)"];
const STORAGE_KEY="no-kidding-band-manager-v2";
const LEGACY_KEYS=["no-kidding-band-manager-v03","no-kidding-band-manager-v18"];

const typeNames={live:"ライブ",studio:"スタジオ",meeting:"ミーティング",recording:"レコーディング",other:"その他"};
let currentPage="home";
let activeFilter="all";
let currentPollId=null;
let workingAnswers={};
let selectedResultDates=new Set();

function uuid(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random()}`}
function esc(value=""){return String(value).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function yen(n){return new Intl.NumberFormat("ja-JP",{style:"currency",currency:"JPY",maximumFractionDigits:0}).format(Number(n||0))}
function todayIso(){return new Date().toISOString().slice(0,10)}
function eventTime(x){return new Date(`${x.date}T${x.time||"23:59"}:00`)}

function defaultState(){
  return {
    schedules:[
      {id:uuid(),type:"studio",title:"スタジオ練習",date:"2026-07-20",time:"20:00",place:"熊本市内スタジオ",quota:0,memo:""},
      {id:uuid(),type:"live",title:"九州スカフェス",date:"2026-09-22",time:"",place:"場所未定",quota:0,memo:""}
    ],
    polls:[],
    merch:[
      {id:uuid(),name:"NO KIDDING Tシャツ",category:"Tシャツ",variant:"ブラック / L",stock:8,price:2500,cost:1200},
      {id:uuid(),name:"ステッカーセット",category:"ステッカー",variant:"3枚組",stock:23,price:500,cost:150}
    ]
  };
}
function normalizeState(raw){
  const state=raw&&typeof raw==="object"?raw:defaultState();
  state.schedules=Array.isArray(state.schedules)?state.schedules:[];
  state.polls=Array.isArray(state.polls)?state.polls:[];
  state.merch=Array.isArray(state.merch)?state.merch:[];
  state.polls.forEach(p=>{
    p.answers=p.answers||{};
    p.finalizedDates=Array.isArray(p.finalizedDates)?p.finalizedDates:(p.finalizedDate?[p.finalizedDate]:[]);
  });
  return state;
}
function loadState(){
  try{
    const current=localStorage.getItem(STORAGE_KEY);
    if(current)return normalizeState(JSON.parse(current));
    for(const key of LEGACY_KEYS){
      const old=localStorage.getItem(key);
      if(old){
        const migrated=normalizeState(JSON.parse(old));
        localStorage.setItem(STORAGE_KEY,JSON.stringify(migrated));
        return migrated;
      }
    }
  }catch(error){console.error(error)}
  return defaultState();
}
let state=loadState();
function save(){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
  renderAll();
}

function sortedSchedules(){return [...state.schedules].sort((a,b)=>eventTime(a)-eventTime(b))}
function renderPage(page){
  document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===page));
  currentPage=page;
  window.scrollTo(0,0);
  if(page==="home")renderHome();
  if(page==="schedule")renderSchedules();
  if(page==="studioPolls")renderPolls();
  if(page==="merch")renderMerch();
}
function showPage(page,{replace=false}={}){
  renderPage(page);
  const stateObj={page};
  if(replace)history.replaceState(stateObj,"",`#${page}`);
  else if(history.state?.page!==page)history.pushState(stateObj,"",`#${page}`);
}
function goBack(fallback="home"){
  if(history.length>1)history.back();
  else showPage(fallback,{replace:true});
}

document.querySelectorAll("[data-page]").forEach(button=>button.addEventListener("click",()=>showPage(button.dataset.page)));
document.querySelectorAll("[data-back]").forEach(button=>button.addEventListener("click",()=>goBack(button.dataset.fallback)));
document.querySelectorAll("[data-close]").forEach(button=>button.addEventListener("click",()=>$(button.dataset.close).close()));
window.addEventListener("popstate",event=>renderPage(event.state?.page||"home"));
history.replaceState({page:"home"},"","#home");

const menu=$("sideMenu"),overlay=$("menuOverlay");
function openMenu(){
  overlay.hidden=false;menu.classList.add("open");document.body.classList.add("menu-open");
  history.pushState({page:currentPage,menu:true},"",location.href);
}
function closeMenu(back=false){
  overlay.hidden=true;menu.classList.remove("open");document.body.classList.remove("menu-open");
  if(back&&history.state?.menu)history.back();
}
$("menuBtn").addEventListener("click",openMenu);
$("closeMenuBtn").addEventListener("click",()=>closeMenu(true));
overlay.addEventListener("click",()=>closeMenu(true));
document.querySelectorAll("[data-menu-page]").forEach(button=>button.addEventListener("click",()=>{
  closeMenu(false);showPage(button.dataset.menuPage);
}));

function renderHome(){
  const upcoming=sortedSchedules().filter(x=>eventTime(x)>=new Date()).slice(0,3);
  $("homeScheduleList").innerHTML=upcoming.length?upcoming.map(x=>{
    const d=new Date(`${x.date}T00:00:00`);
    const weeks=["日","月","火","水","木","金","土"];
    return `<button class="home-event ${x.type}" data-open-schedule>
      <div class="home-date"><strong>${d.getMonth()+1}/${d.getDate()}</strong><small>(${weeks[d.getDay()]})</small></div>
      <div class="home-event-copy">
        <h3><span class="event-badge">${typeNames[x.type]||"予定"}</span>${esc(x.title)}</h3>
        <p>◷ ${esc(x.time||"時間未定")}　📍 ${esc(x.place||"場所未定")}</p>
      </div>
      <span class="home-arrow">›</span>
    </button>`;
  }).join(""):`<div class="empty">今後の確定予定はありません。</div>`;
  document.querySelectorAll("[data-open-schedule]").forEach(b=>b.addEventListener("click",()=>showPage("schedule")));
}

function renderSchedules(){
  const arr=sortedSchedules().filter(x=>activeFilter==="all"||x.type===activeFilter);
  $("scheduleList").innerHTML=arr.length?arr.map(x=>`<article class="card ${x.type}">
    <div class="card-head">
      <div><h3>${esc(x.title)}</h3><p>${esc(x.date)} ${esc(x.time||"")}</p></div>
      <span class="badge">${esc(typeNames[x.type]||"その他")}</span>
    </div>
    <p>📍 ${esc(x.place||"場所未定")}</p>
    ${x.quota?`<p>ノルマ ${yen(x.quota)}</p>`:""}
    ${x.memo?`<p>📝 ${esc(x.memo)}</p>`:""}
    <div class="row-actions">
      <button onclick="editSchedule('${x.id}')">編集</button>
      <button class="danger" onclick="deleteSchedule('${x.id}')">削除</button>
    </div>
  </article>`).join(""):`<div class="empty">該当する予定はありません。</div>`;
}
document.querySelectorAll("[data-filter]").forEach(button=>button.addEventListener("click",()=>{
  activeFilter=button.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach(x=>x.classList.toggle("active",x===button));
  renderSchedules();
}));

function openScheduleDialog(item=null){
  $("scheduleForm").reset();
  $("scheduleId").value=item?.id||"";
  $("scheduleDialogTitle").textContent=item?"予定を編集":"確定予定を追加";
  if(item){
    $("scheduleType").value=item.type;
    $("scheduleTitle").value=item.title;
    $("scheduleDate").value=item.date;
    $("scheduleTime").value=item.time||"";
    $("schedulePlace").value=item.place||"";
    $("scheduleQuota").value=item.quota||"";
    $("scheduleMemo").value=item.memo||"";
  }else{
    $("scheduleDate").value=todayIso();
  }
  $("scheduleDialog").showModal();
}
$("addSchedule").addEventListener("click",()=>openScheduleDialog());
$("quickAddBtn").addEventListener("click",()=>openScheduleDialog());
$("homeAddSchedule").addEventListener("click",()=>openScheduleDialog());
$("scheduleForm").addEventListener("submit",event=>{
  event.preventDefault();
  const id=$("scheduleId").value;
  const data={
    type:$("scheduleType").value,title:$("scheduleTitle").value.trim(),date:$("scheduleDate").value,
    time:$("scheduleTime").value,place:$("schedulePlace").value.trim(),
    quota:Number($("scheduleQuota").value||0),memo:$("scheduleMemo").value.trim()
  };
  if(id)Object.assign(state.schedules.find(x=>x.id===id),data);
  else state.schedules.push({id:uuid(),...data});
  $("scheduleDialog").close();save();
});
window.editSchedule=id=>openScheduleDialog(state.schedules.find(x=>x.id===id));
window.deleteSchedule=id=>{
  const item=state.schedules.find(x=>x.id===id);
  if(item&&confirm(`「${item.title}」を削除しますか？`)){state.schedules=state.schedules.filter(x=>x.id!==id);save()}
};

function datesForMonth(month,weekdays){
  const [year,m]=month.split("-").map(Number),last=new Date(year,m,0).getDate(),dates=[];
  for(let day=1;day<=last;day++){
    const d=new Date(year,m-1,day);
    if(weekdays.includes(d.getDay()))dates.push(`${month}-${String(day).padStart(2,"0")}`);
  }
  return dates;
}
function renderPolls(){
  $("pollList").innerHTML=state.polls.length?state.polls.map(p=>{
    const answered=MEMBERS.filter(m=>p.answers[m]).length;
    return `<article class="poll-card">
      <div class="poll-head"><div><h3>${esc(p.title)}</h3><p>${esc(p.month)} / ${p.dates.length}日候補</p></div><span class="badge">${p.finalizedDates.length?p.finalizedDates.length+"日確定":"調整中"}</span></div>
      <p>回答 ${answered}/${MEMBERS.length}人</p>
      ${p.finalizedDates.length?`<p>✅ ${p.finalizedDates.map(d=>esc(d)).join("、")}</p>`:""}
      <div class="row-actions">
        <button onclick="openPoll('${p.id}')">回答</button>
        <button onclick="openPollResults('${p.id}')">集計</button>
        <button onclick="editPoll('${p.id}')">編集</button>
        <button class="danger" onclick="deletePoll('${p.id}')">削除</button>
      </div>
    </article>`;
  }).join(""):`<div class="empty">右上の＋から日程調整を作成してください。</div>`;
}
function openPollDialog(p=null){
  $("pollForm").reset();
  $("pollEditId").value=p?.id||"";
  $("pollDialogTitle").textContent=p?"日程調整を編集":"スタジオ日程調整を作成";
  const now=new Date(),month=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  $("pollMonth").value=p?.month||month;
  $("pollTitle").value=p?.title||`${now.getMonth()+1}月スタジオ日程調整`;
  $("pollStartTime").value=p?.startTime||"20:00";
  $("pollEndTime").value=p?.endTime||"23:00";
  $("pollPlace").value=p?.place||"";
  document.querySelectorAll("#weekdayOptions input").forEach(x=>x.checked=p?new Set(p.dates.map(d=>new Date(`${d}T00:00:00`).getDay())).has(Number(x.value)):true);
  $("pollDialog").showModal();
}
$("addPoll").addEventListener("click",()=>openPollDialog());
window.editPoll=id=>openPollDialog(state.polls.find(x=>x.id===id));
$("pollForm").addEventListener("submit",event=>{
  event.preventDefault();
  const id=$("pollEditId").value,month=$("pollMonth").value;
  const weekdays=[...document.querySelectorAll("#weekdayOptions input:checked")].map(x=>Number(x.value));
  if(!weekdays.length)return alert("曜日を1つ以上選択してください。");
  const dates=datesForMonth(month,weekdays);
  const data={title:$("pollTitle").value.trim(),month,startTime:$("pollStartTime").value,endTime:$("pollEndTime").value,place:$("pollPlace").value.trim(),dates};
  if(id){
    const p=state.polls.find(x=>x.id===id);
    Object.assign(p,data);
    Object.keys(p.answers).forEach(member=>{
      p.answers[member]=Object.fromEntries(Object.entries(p.answers[member]).filter(([date])=>dates.includes(date)));
    });
    p.finalizedDates=p.finalizedDates.filter(d=>dates.includes(d));
  }else state.polls.push({id:uuid(),...data,answers:{},finalizedDates:[]});
  $("pollDialog").close();save();showPage("studioPolls");
});
window.deletePoll=id=>{
  const p=state.polls.find(x=>x.id===id);
  if(p&&confirm(`「${p.title}」を削除しますか？`)){
    state.polls=state.polls.filter(x=>x.id!==id);
    state.schedules=state.schedules.filter(x=>x.sourcePollId!==id);
    save();
  }
};
window.openPoll=id=>{
  currentPollId=id;
  const p=state.polls.find(x=>x.id===id);
  $("pollDetailTitle").textContent=p.title;
  $("pollDetailMeta").textContent=`${p.month}　${p.startTime}-${p.endTime}　${p.place||"場所未定"}`;
  $("answerMember").innerHTML=MEMBERS.map(m=>`<option>${esc(m)}</option>`).join("");
  workingAnswers={...(p.answers[MEMBERS[0]]||{})};
  $("answerMember").onchange=()=>{workingAnswers={...(p.answers[$("answerMember").value]||{})};renderAnswers()};
  renderAnswers();showPage("pollDetail");
};
function renderAnswers(){
  const p=state.polls.find(x=>x.id===currentPollId);
  $("pollAnswerRows").innerHTML=p.dates.map(date=>{
    const d=new Date(`${date}T00:00:00`),week=["日","月","火","水","木","金","土"][d.getDay()],v=workingAnswers[date]||"";
    return `<div class="answer-row"><strong>${date.slice(5).replace("-",".")}(${week})</strong><div class="answer-buttons">
      <button class="ok ${v==="ok"?"active":""}" onclick="setAnswer('${date}','ok')">○</button>
      <button class="maybe ${v==="maybe"?"active":""}" onclick="setAnswer('${date}','maybe')">△</button>
      <button class="no ${v==="no"?"active":""}" onclick="setAnswer('${date}','no')">×</button>
    </div></div>`;
  }).join("");
}
window.setAnswer=(date,value)=>{workingAnswers[date]=value;renderAnswers()};
$("saveAnswers").addEventListener("click",()=>{
  const p=state.polls.find(x=>x.id===currentPollId);
  p.answers[$("answerMember").value]={...workingAnswers};save();alert("回答を保存しました。");
});
$("openResults").addEventListener("click",()=>openPollResults(currentPollId));
window.openPollResults=id=>{
  currentPollId=id;
  const p=state.polls.find(x=>x.id===id);
  selectedResultDates=new Set(p.finalizedDates||[]);
  renderResults();showPage("pollResults");
};
function renderResults(){
  const p=state.polls.find(x=>x.id===currentPollId);
  const rows=p.dates.map(date=>{
    let ok=0,maybe=0,no=0;
    MEMBERS.forEach(member=>{
      const a=p.answers[member]?.[date];
      if(a==="ok")ok++;else if(a==="maybe")maybe++;else if(a==="no")no++;
    });
    return {date,ok,maybe,no,score:ok*2+maybe};
  }).sort((a,b)=>b.score-a.score||a.date.localeCompare(b.date));
  $("resultRows").innerHTML=rows.map(r=>`<div class="result-row ${selectedResultDates.has(r.date)?"selected":""}">
    <strong>${r.date.slice(5).replace("-",".")}</strong>
    <div class="result-counts"><span>○${r.ok}</span><span>△${r.maybe}</span><span>×${r.no}</span></div>
    <button class="${selectedResultDates.has(r.date)?"selected":""}" onclick="toggleResult('${r.date}')">${selectedResultDates.has(r.date)?"選択済み":"選択"}</button>
  </div>`).join("");
  $("finalizeSelectedDates").textContent=`選択した日を確定（${selectedResultDates.size}日）`;
}
window.toggleResult=date=>{selectedResultDates.has(date)?selectedResultDates.delete(date):selectedResultDates.add(date);renderResults()};
$("clearSelectedDates").addEventListener("click",()=>{selectedResultDates.clear();renderResults()});
$("finalizeSelectedDates").addEventListener("click",()=>{
  const p=state.polls.find(x=>x.id===currentPollId),dates=[...selectedResultDates].sort();
  if(!dates.length)return alert("1日以上選択してください。");
  state.schedules=state.schedules.filter(s=>s.sourcePollId!==p.id||dates.includes(s.date));
  dates.forEach(date=>{
    const existing=state.schedules.find(s=>s.sourcePollId===p.id&&s.date===date);
    const item={type:"studio",title:"スタジオ練習",date,time:p.startTime,place:p.place||"熊本市内スタジオ",quota:0,memo:`${p.title}から確定`,sourcePollId:p.id};
    if(existing)Object.assign(existing,item);else state.schedules.push({id:uuid(),...item});
  });
  p.finalizedDates=dates;save();alert(`${dates.length}日を確定しました。`);showPage("schedule");
});

function renderMerch(){
  const stock=state.merch.reduce((s,x)=>s+Number(x.stock||0),0);
  const value=state.merch.reduce((s,x)=>s+Number(x.stock||0)*Number(x.cost||0),0);
  $("merchItemCount").textContent=state.merch.length;
  $("merchStockTotal").textContent=stock;
  $("merchValueTotal").textContent=yen(value);
  $("merchList").innerHTML=state.merch.length?state.merch.map(x=>`<article class="merch-card">
    <div class="merch-head"><div><h3>${esc(x.name)}</h3><p>${esc(x.category)} / ${esc(x.variant||"種類なし")}</p></div><span class="badge">${yen(x.price)}</span></div>
    <p class="${x.stock<=3?"low-stock":""}">在庫：${x.stock}${x.stock<=3?"（残りわずか）":""}</p>
    <p>仕入：${yen(x.cost)}　利益：${yen(x.price-x.cost)}</p>
    <div class="row-actions">
      <div class="stock-controls"><button onclick="changeStock('${x.id}',-1)">−</button><b>${x.stock}</b><button onclick="changeStock('${x.id}',1)">＋</button></div>
      <button onclick="editMerch('${x.id}')">編集</button>
      <button class="danger" onclick="deleteMerch('${x.id}')">削除</button>
    </div>
  </article>`).join(""):`<div class="empty">右上の＋から商品を追加してください。</div>`;
}
function openMerchDialog(item=null){
  $("merchForm").reset();$("merchId").value=item?.id||"";
  $("merchDialogTitle").textContent=item?"商品を編集":"商品を追加";
  if(item){
    $("merchName").value=item.name;$("merchCategory").value=item.category;$("merchVariant").value=item.variant||"";
    $("merchStock").value=item.stock;$("merchPrice").value=item.price;$("merchCost").value=item.cost||0;
  }else{$("merchStock").value=0;$("merchPrice").value=0;$("merchCost").value=0}
  $("merchDialog").showModal();
}
$("addMerch").addEventListener("click",()=>openMerchDialog());
$("merchForm").addEventListener("submit",event=>{
  event.preventDefault();
  const id=$("merchId").value,data={name:$("merchName").value.trim(),category:$("merchCategory").value,variant:$("merchVariant").value.trim(),stock:Number($("merchStock").value),price:Number($("merchPrice").value),cost:Number($("merchCost").value)};
  if(id)Object.assign(state.merch.find(x=>x.id===id),data);else state.merch.push({id:uuid(),...data});
  $("merchDialog").close();save();
});
window.editMerch=id=>openMerchDialog(state.merch.find(x=>x.id===id));
window.deleteMerch=id=>{const x=state.merch.find(x=>x.id===id);if(x&&confirm(`「${x.name}」を削除しますか？`)){state.merch=state.merch.filter(x=>x.id!==id);save()}};
window.changeStock=(id,amount)=>{const x=state.merch.find(x=>x.id===id);x.stock=Math.max(0,Number(x.stock)+amount);save()};

function renderAll(){renderHome();renderSchedules();renderPolls();renderMerch()}
renderAll();

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js?v=220").catch(console.error));
}
