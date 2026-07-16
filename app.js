const STORAGE_KEY="no-kidding-band-manager-v03";
const members=["YAMA (Vo)","殿 (Gt)","うっちー (Ba)","RYUTO (Dr)","JUN (Tp)","MASTER (Tb)"];
const typeNames={live:"ライブ",studio:"スタジオ",meeting:"ミーティング",recording:"レコーディング",other:"その他"};
const typeStickers={live:"NEXT LIVE",studio:"NEXT STUDIO",meeting:"NEXT MEETING",recording:"NEXT RECORDING",other:"NEXT EVENT"};

let state=loadState();
let activeFilter="all";
let currentPollId=null;
let workingAnswers={};

function loadState(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(saved&&Array.isArray(saved.schedules)&&Array.isArray(saved.polls)) return saved;
  }catch(e){}
  return{
    schedules:[
      {id:crypto.randomUUID(),type:"live",title:"熊本 Be-9 ライブ",date:"2026-08-02",time:"18:00",place:"KUMAMOTO Be-9",quota:20000,memo:"集合15:00"}
    ],
    polls:[]
  };
}
function persist(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));renderAll()}
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const eventDate=x=>new Date(`${x.date}T${x.time||"00:00"}:00`);
const sortedSchedules=()=>[...state.schedules].sort((a,b)=>eventDate(a)-eventDate(b));
const yen=v=>new Intl.NumberFormat("ja-JP",{style:"currency",currency:"JPY",maximumFractionDigits:0}).format(Number(v||0));

let currentPage="home";
function renderPage(id){
  currentPage=id;
  document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===id));
  document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===id));
  scrollTo(0,0);
}
function showPage(id,{replace=false}={}){
  if(id===currentPage)return;
  const state={page:id};
  if(replace)history.replaceState(state,"",`#${id}`);
  else history.pushState(state,"",`#${id}`);
  renderPage(id);
}
function goBack(fallback="home"){
  if(history.state&&history.length>1)history.back();
  else showPage(fallback,{replace:true});
}
document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>showPage(b.dataset.page));
document.querySelectorAll("[data-back]").forEach(b=>b.onclick=()=>goBack(b.dataset.fallback||"home"));
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>$(b.dataset.close).close());
window.addEventListener("popstate",e=>{
  const page=e.state?.page||location.hash.replace("#","")||"home";
  renderPage(document.getElementById(page)?page:"home");
});
const initialPage=location.hash.replace("#","");
history.replaceState({page:document.getElementById(initialPage)?initialPage:"home"},"",location.href);
renderPage(history.state.page);

document.querySelectorAll("[data-filter]").forEach(button=>{
  button.onclick=()=>{
    activeFilter=button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(x=>x.classList.toggle("active",x===button));
    renderSchedules();
  };
});

function renderHome(){
  const next=sortedSchedules().find(x=>eventDate(x)>=new Date());
  if(next){
    $("nextType").textContent=typeStickers[next.type]||"NEXT EVENT";
    $("nextTitle").textContent=next.title;
    $("nextMeta").textContent=`${next.date} ${next.time||""} / ${next.place||"場所未定"}`;
    const today=new Date();today.setHours(0,0,0,0);
    const target=new Date(`${next.date}T00:00:00`);
    const diff=Math.ceil((target-today)/86400000);
    $("countdown").textContent=diff>0?`あと ${diff} 日！`:diff===0?"今日！":"開催済み";
  }else{
    $("nextType").textContent="NEXT EVENT";
    $("nextTitle").textContent="予定を登録してください";
    $("nextMeta").textContent="スケジュール画面から追加できます。";
    $("countdown").textContent="LET'S GO!";
  }
  $("scheduleCount").textContent=state.schedules.length;
  $("pollCount").textContent=state.polls.filter(p=>!p.finalizedDate).length;
  $("studioCount").textContent=state.schedules.filter(s=>s.type==="studio").length;
}

function renderSchedules(){
  const arr=sortedSchedules().filter(x=>activeFilter==="all"||x.type===activeFilter);
  $("scheduleList").innerHTML=arr.length?arr.map(x=>`<article class="item ${x.type}">
    <div class="item-head"><div><h3>${esc(x.title)}</h3><p>${esc(x.date)} ${esc(x.time||"")}</p></div><span class="badge">${esc(typeNames[x.type]||"その他")}</span></div>
    <p>📍 ${esc(x.place||"場所未定")}</p>
    ${Number(x.quota||0)>0?`<span class="quota">ノルマ ${yen(x.quota)}</span>`:""}
    ${x.memo?`<p>📝 ${esc(x.memo)}</p>`:""}
    <div class="row-actions"><button onclick="editSchedule('${x.id}')">編集</button><button class="danger" onclick="deleteSchedule('${x.id}')">削除</button></div>
  </article>`).join(""):`<article class="panel">該当する予定はありません。</article>`;
}

function renderPolls(){
  $("pollList").innerHTML=state.polls.length?state.polls.map(p=>{
    const answered=members.filter(m=>p.answers&&p.answers[m]).length;
    return `<article class="poll-card">
      <div class="poll-meta"><div><h3>${esc(p.title)}</h3><p>${esc(p.month)} / ${p.dates.length}日候補</p></div><span class="poll-status">${p.finalizedDate?"確定済み":"調整中"}</span></div>
      <p>回答 ${answered}/${members.length}人</p>
      ${p.finalizedDate?`<p>✅ 確定：${esc(p.finalizedDate)} ${esc(p.startTime)}-${esc(p.endTime)}</p>`:""}
      <div class="row-actions">
        <button onclick="openPoll('${p.id}')">${p.finalizedDate?"結果を見る":"回答する"}</button>
        <button onclick="openPollResults('${p.id}')">集計</button>
        <button onclick="editPoll('${p.id}')">編集</button>
        <button class="danger" onclick="deletePoll('${p.id}')">削除</button>
      </div>
    </article>`;
  }).join(""):`<article class="panel">右上の「＋」から月単位の日程調整を作成してください。</article>`;
}

function renderAll(){renderHome();renderSchedules();renderPolls()}
renderAll();

$("addSchedule").onclick=()=>{
  $("scheduleForm").reset();$("scheduleId").value="";$("scheduleDialogTitle").textContent="予定を追加";$("scheduleDialog").showModal();
};
$("scheduleForm").onsubmit=e=>{
  e.preventDefault();
  const id=$("scheduleId").value;
  const obj={type:$("scheduleType").value,title:$("scheduleTitle").value.trim(),date:$("scheduleDate").value,time:$("scheduleTime").value,place:$("schedulePlace").value.trim(),quota:Number($("scheduleQuota").value||0),memo:$("scheduleMemo").value.trim()};
  if(id) Object.assign(state.schedules.find(x=>x.id===id),obj); else state.schedules.push({id:crypto.randomUUID(),...obj});
  $("scheduleDialog").close();persist();
};
window.editSchedule=id=>{
  const x=state.schedules.find(v=>v.id===id);if(!x)return;
  $("scheduleDialogTitle").textContent="予定を編集";$("scheduleId").value=x.id;$("scheduleType").value=x.type;$("scheduleTitle").value=x.title;$("scheduleDate").value=x.date;$("scheduleTime").value=x.time||"";$("schedulePlace").value=x.place||"";$("scheduleQuota").value=x.quota||"";$("scheduleMemo").value=x.memo||"";$("scheduleDialog").showModal();
};
window.deleteSchedule=id=>{const x=state.schedules.find(v=>v.id===id);if(x&&confirm(`「${x.title}」を削除しますか？`)){state.schedules=state.schedules.filter(v=>v.id!==id);persist()}};

$("addPoll").onclick=()=>{
  $("pollForm").reset();
  $("pollEditId").value="";
  $("pollDialogTitle").textContent="スタジオ日程調整を作成";
  const now=new Date();$("pollMonth").value=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  $("pollTitle").value=`${now.getMonth()+1}月スタジオ日程調整`;
  $("pollStartTime").value="20:00";$("pollEndTime").value="23:00";
  document.querySelectorAll("#weekdayOptions input").forEach(x=>x.checked=true);
  $("pollDialog").showModal();
};

function datesForMonth(month,weekdays){
  const [y,m]=month.split("-").map(Number);
  const days=new Date(y,m,0).getDate();
  const dates=[];
  for(let d=1;d<=days;d++){
    const dt=new Date(y,m-1,d);
    if(weekdays.includes(dt.getDay()))dates.push(`${month}-${String(d).padStart(2,"0")}`);
  }
  return dates;
}

window.editPoll=id=>{
  const p=state.polls.find(x=>x.id===id);if(!p)return;
  $("pollEditId").value=p.id;
  $("pollDialogTitle").textContent="日程調整を編集";
  $("pollMonth").value=p.month;
  $("pollTitle").value=p.title;
  $("pollStartTime").value=p.startTime||"20:00";
  $("pollEndTime").value=p.endTime||"23:00";
  $("pollPlace").value=p.place||"";
  const used=new Set(p.dates.map(d=>new Date(`${d}T00:00:00`).getDay()));
  document.querySelectorAll("#weekdayOptions input").forEach(x=>x.checked=used.has(Number(x.value)));
  $("pollDialog").showModal();
};

$("pollForm").onsubmit=e=>{
  e.preventDefault();
  const editId=$("pollEditId").value;
  const month=$("pollMonth").value;
  const weekdays=[...document.querySelectorAll("#weekdayOptions input:checked")].map(x=>Number(x.value));
  if(!weekdays.length){alert("候補に含める曜日を1つ以上選んでください。");return;}
  const dates=datesForMonth(month,weekdays);
  const values={
    title:$("pollTitle").value.trim(),month,startTime:$("pollStartTime").value,endTime:$("pollEndTime").value,place:$("pollPlace").value.trim(),dates
  };
  if(editId){
    const p=state.polls.find(x=>x.id===editId);
    if(!p)return;
    Object.assign(p,values);
    members.forEach(member=>{
      const old=p.answers?.[member]||{};
      p.answers[member]=Object.fromEntries(Object.entries(old).filter(([date])=>dates.includes(date)));
    });
    if(p.finalizedDate&&!dates.includes(p.finalizedDate)){
      p.finalizedDate=null;
      state.schedules=state.schedules.filter(x=>x.sourcePollId!==p.id);
    }else if(p.finalizedDate){
      const schedule=state.schedules.find(x=>x.sourcePollId===p.id);
      if(schedule)Object.assign(schedule,{date:p.finalizedDate,time:p.startTime,place:p.place||"熊本市内スタジオ",memo:`${p.title}から決定 / ${p.startTime}-${p.endTime}`});
    }
  }else{
    state.polls.push({id:crypto.randomUUID(),...values,answers:{},finalizedDate:null});
  }
  $("pollDialog").close();persist();showPage("studioPolls");
};

window.openPoll=id=>{
  currentPollId=id;
  const p=state.polls.find(x=>x.id===id);if(!p)return;
  $("pollDetailTitle").textContent=p.title;
  $("pollDetailMonth").textContent=`${p.month}　${p.startTime}-${p.endTime}　${p.place||"場所未定"}`;
  $("answerMember").innerHTML=members.map(m=>`<option value="${esc(m)}">${esc(m)}</option>`).join("");
  workingAnswers={...(p.answers[members[0]]||{})};
  renderAnswerRows();
  $("answerMember").onchange=()=>{workingAnswers={...(p.answers[$("answerMember").value]||{})};renderAnswerRows()};
  showPage("pollDetail");
};

function renderAnswerRows(){
  const p=state.polls.find(x=>x.id===currentPollId);if(!p)return;
  $("pollAnswerRows").innerHTML=p.dates.map(date=>{
    const value=workingAnswers[date]||"";
    const dt=new Date(`${date}T00:00:00`);
    const week=["日","月","火","水","木","金","土"][dt.getDay()];
    return `<div class="answer-row"><div class="answer-date">${date.slice(5).replace("-",".")}(${week})</div><div class="answer-buttons">
      <button class="ok ${value==="ok"?"active":""}" onclick="setWorkingAnswer('${date}','ok')">○</button>
      <button class="maybe ${value==="maybe"?"active":""}" onclick="setWorkingAnswer('${date}','maybe')">△</button>
      <button class="no ${value==="no"?"active":""}" onclick="setWorkingAnswer('${date}','no')">×</button>
    </div></div>`;
  }).join("");
}
window.setWorkingAnswer=(date,value)=>{workingAnswers[date]=value;renderAnswerRows()};

$("saveAnswers").onclick=()=>{
  const p=state.polls.find(x=>x.id===currentPollId);if(!p)return;
  p.answers[$("answerMember").value]={...workingAnswers};persist();alert("回答を保存しました。");
};

$("openResults").onclick=()=>openPollResults(currentPollId);
window.openPollResults=id=>{
  currentPollId=id;
  renderResults();
  showPage("pollResults");
};

function renderResults(){
  const p=state.polls.find(x=>x.id===currentPollId);if(!p)return;
  const rows=p.dates.map(date=>{
    let ok=0,maybe=0,no=0;
    members.forEach(m=>{
      const a=p.answers?.[m]?.[date];
      if(a==="ok")ok++;else if(a==="maybe")maybe++;else if(a==="no")no++;
    });
    return {date,ok,maybe,no,score:ok*2+maybe};
  }).sort((a,b)=>b.score-a.score||a.date.localeCompare(b.date));
  const best=rows[0]?.score??0;
  $("resultRows").innerHTML=rows.map(r=>{
    const dt=new Date(`${r.date}T00:00:00`);
    const week=["日","月","火","水","木","金","土"][dt.getDay()];
    return `<div class="result-row ${r.score===best&&best>0?"best-date":""}">
      <div>${r.date.slice(5).replace("-",".")}(${week})</div>
      <div class="result-counts"><span class="${r.score===best&&best>0?"best":""}">○${r.ok}</span><span>△${r.maybe}</span><span>×${r.no}</span></div>
      <div class="result-actions"><button class="punk-btn" onclick="finalizeStudio('${r.date}')">この日に決定</button></div>
    </div>`;
  }).join("");
}

window.finalizeStudio=date=>{
  const p=state.polls.find(x=>x.id===currentPollId);if(!p)return;
  if(!confirm(`${date}を正式なスタジオ予定にしますか？`))return;
  p.finalizedDate=date;
  const existing=state.schedules.find(s=>s.sourcePollId===p.id);
  const obj={type:"studio",title:"スタジオ練習",date,time:p.startTime,place:p.place||"熊本市内スタジオ",quota:0,memo:`${p.title}から決定 / ${p.startTime}-${p.endTime}`,sourcePollId:p.id};
  if(existing)Object.assign(existing,obj);else state.schedules.push({id:crypto.randomUUID(),...obj});
  persist();
  alert("スタジオ予定に追加しました。");
  showPage("schedule");
};

window.deletePoll=id=>{
  const p=state.polls.find(x=>x.id===id);
  if(p&&confirm(`「${p.title}」を削除しますか？`)){
    state.polls=state.polls.filter(x=>x.id!==id);
    state.schedules=state.schedules.filter(x=>x.sourcePollId!==id);
    persist();
  }
};

let deferredPrompt=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e});
$("installBtn").onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null}else alert("ブラウザのメニューから「ホーム画面に追加」を選択してください。")};