
const members = ["YAMA (Vo)","殿 (Gt)","うっちー (Ba)","RYUTO (Dr)","JUN (Tp)","MASTER (Tb)"];
const defaults = {
  schedules:[
    {id:crypto.randomUUID(),type:"live",title:"熊本 Be-9 ライブ",date:"2026-08-02",time:"18:00",place:"KUMAMOTO Be-9",memo:"集合 15:00"},
    {id:crypto.randomUUID(),type:"studio",title:"スタジオ練習",date:"2026-07-24",time:"20:00",place:"熊本市内スタジオ",memo:"新曲確認"}
  ],
  merch:[
    {id:crypto.randomUUID(),name:"NO KIDDING Tシャツ S",stock:5,price:2500},
    {id:crypto.randomUUID(),name:"NO KIDDING Tシャツ M",stock:8,price:2500},
    {id:crypto.randomUUID(),name:"ステッカー",stock:30,price:300}
  ],
  finance:[
    {id:crypto.randomUUID(),kind:"income",title:"物販売上",amount:12500,date:"2026-07-12"},
    {id:crypto.randomUUID(),kind:"expense",title:"スタジオ代",amount:6000,date:"2026-07-13"}
  ],
  attendance:{}
};
let state = JSON.parse(localStorage.getItem("nkbm-state") || "null") || defaults;
const save=()=>{localStorage.setItem("nkbm-state",JSON.stringify(state));renderAll();};

const pages=[...document.querySelectorAll(".page")], navs=[...document.querySelectorAll("[data-nav]")];
function navigate(name){
  pages.forEach(p=>p.classList.toggle("active",p.dataset.page===name));
  document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.toggle("active",b.dataset.nav===name));
  window.scrollTo({top:0,behavior:"smooth"});
}
navs.forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.nav)));

function yen(n){return new Intl.NumberFormat("ja-JP",{style:"currency",currency:"JPY",maximumFractionDigits:0}).format(n)}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function renderHome(){
  const sorted=[...state.schedules].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  const now=new Date(); const next=sorted.find(x=>new Date(`${x.date}T${x.time||"00:00"}`)>=now) || sorted[0];
  document.getElementById("nextTitle").textContent=next?next.title:"次回予定を登録してください";
  document.getElementById("nextMeta").textContent=next?`${next.date} ${next.time||""} / ${next.place||""}`:"スケジュール画面から登録できます。";
  if(next){
    const diff=Math.ceil((new Date(`${next.date}T${next.time||"00:00"}`)-now)/86400000);
    document.getElementById("countdown").textContent=diff>=0?`あと ${diff} 日！`:"PAST EVENT";
  }
  document.getElementById("scheduleCount").textContent=state.schedules.length;
  document.getElementById("stockCount").textContent=state.merch.reduce((a,b)=>a+Number(b.stock),0);
  document.getElementById("balanceValue").textContent=yen(balance());
}
function renderSchedules(){
  const el=document.getElementById("scheduleList");
  const arr=[...state.schedules].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  el.innerHTML=arr.length?arr.map(x=>`<article class="item ${esc(x.type)}">
    <div class="item-head"><div><h3>${esc(x.title)}</h3><p>${esc(x.date)} ${esc(x.time)}</p></div><span class="badge">${esc(x.type.toUpperCase())}</span></div>
    <p>📍 ${esc(x.place||"-")}</p><small>${esc(x.memo||"")}</small>
    <div class="row-actions"><button class="tiny" onclick="delSchedule('${x.id}')">削除</button></div>
  </article>`).join(""):`<div class="empty">予定がありません</div>`;
  const select=document.getElementById("attendanceEvent");
  select.innerHTML=arr.map(x=>`<option value="${x.id}">${esc(x.date)} ${esc(x.title)}</option>`).join("");
}
function renderAttendance(){
  const eventId=document.getElementById("attendanceEvent").value || state.schedules[0]?.id;
  const record=state.attendance[eventId]||{};
  document.getElementById("attendanceList").innerHTML=members.map(m=>`<div class="item att-row">
    <strong>${m}</strong><div class="att-buttons">
      <button class="${record[m]==="ok"?"active ok":""}" onclick="setAtt('${eventId}','${m}','ok')">○</button>
      <button class="${record[m]==="maybe"?"active maybe":""}" onclick="setAtt('${eventId}','${m}','maybe')">△</button>
      <button class="${record[m]==="no"?"active no":""}" onclick="setAtt('${eventId}','${m}','no')">×</button>
    </div></div>`).join("");
}
function renderMerch(){
  const el=document.getElementById("merchList");
  el.innerHTML=state.merch.length?state.merch.map(x=>`<article class="item">
    <div class="item-head"><div><h3>${esc(x.name)}</h3><p>販売価格 ${yen(x.price)}</p></div><strong>在庫 ${x.stock}</strong></div>
    <div class="row-actions">
      <button class="tiny" onclick="changeStock('${x.id}',-1)">−1 販売</button>
      <button class="tiny" onclick="changeStock('${x.id}',1)">＋1 入荷</button>
      <button class="tiny" onclick="delMerch('${x.id}')">削除</button>
    </div></article>`).join(""):`<div class="empty">商品がありません</div>`;
}
function balance(){return state.finance.reduce((sum,x)=>sum+(x.kind==="income"?Number(x.amount):-Number(x.amount)),0)}
function renderFinance(){
  document.getElementById("financeTotal").textContent=yen(balance());
  const arr=[...state.finance].sort((a,b)=>b.date.localeCompare(a.date));
  document.getElementById("financeList").innerHTML=arr.length?arr.map(x=>`<article class="item ${x.kind==="income"?"studio":"live"}">
    <div class="item-head"><div><h3>${esc(x.title)}</h3><p>${esc(x.date)}</p></div><strong>${x.kind==="income"?"+":"−"}${yen(x.amount)}</strong></div>
    <div class="row-actions"><button class="tiny" onclick="delFinance('${x.id}')">削除</button></div>
  </article>`).join(""):`<div class="empty">記録がありません</div>`;
}
function renderAll(){renderHome();renderSchedules();renderAttendance();renderMerch();renderFinance()}
window.delSchedule=id=>{state.schedules=state.schedules.filter(x=>x.id!==id);delete state.attendance[id];save()};
window.setAtt=(eventId,m,v)=>{state.attendance[eventId]??={};state.attendance[eventId][m]=v;save()};
window.changeStock=(id,d)=>{const x=state.merch.find(x=>x.id===id);x.stock=Math.max(0,Number(x.stock)+d);save()};
window.delMerch=id=>{state.merch=state.merch.filter(x=>x.id!==id);save()};
window.delFinance=id=>{state.finance=state.finance.filter(x=>x.id!==id);save()};
document.getElementById("attendanceEvent").addEventListener("change",renderAttendance);

const dialog=document.getElementById("formDialog"), fields=document.getElementById("dialogFields");
let dialogMode="";
function openDialog(mode){
  dialogMode=mode;
  document.getElementById("dialogTitle").textContent={schedule:"予定を追加",merch:"商品を追加",finance:"会計を記録"}[mode];
  if(mode==="schedule") fields.innerHTML=`
    <label class="field">種類<select name="type"><option value="live">ライブ</option><option value="studio">スタジオ</option><option value="meeting">ミーティング</option><option value="recording">レコーディング</option></select></label>
    <label class="field">タイトル<input name="title" required></label>
    <label class="field">日付<input name="date" type="date" required></label>
    <label class="field">時間<input name="time" type="time"></label>
    <label class="field">場所<input name="place"></label>
    <label class="field">メモ<input name="memo"></label>`;
  if(mode==="merch") fields.innerHTML=`
    <label class="field">商品名<input name="name" required></label>
    <label class="field">在庫数<input name="stock" type="number" min="0" value="0" required></label>
    <label class="field">販売価格<input name="price" type="number" min="0" value="0" required></label>`;
  if(mode==="finance") fields.innerHTML=`
    <label class="field">区分<select name="kind"><option value="income">収入</option><option value="expense">支出</option></select></label>
    <label class="field">内容<input name="title" required></label>
    <label class="field">金額<input name="amount" type="number" min="0" required></label>
    <label class="field">日付<input name="date" type="date" required></label>`;
  dialog.showModal();
}
document.getElementById("addScheduleBtn").onclick=()=>openDialog("schedule");
document.getElementById("addMerchBtn").onclick=()=>openDialog("merch");
document.getElementById("addFinanceBtn").onclick=()=>openDialog("finance");
document.getElementById("dialogForm").addEventListener("submit",e=>{
  if(e.submitter?.value==="cancel") return;
  e.preventDefault();
  const data=Object.fromEntries(new FormData(e.target).entries()); data.id=crypto.randomUUID();
  if(dialogMode==="schedule") state.schedules.push(data);
  if(dialogMode==="merch"){data.stock=Number(data.stock);data.price=Number(data.price);state.merch.push(data)}
  if(dialogMode==="finance"){data.amount=Number(data.amount);state.finance.push(data)}
  dialog.close();save();
});
document.getElementById("menuBtn").onclick=()=>alert("NO KIDDING BAND MANAGER V1.0\nデータはこの端末内に保存されます。");
let deferredPrompt;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;});
document.getElementById("installBtn").onclick=async()=>{
  if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;}
  else alert("iPhoneはSafariの共有ボタン →「ホーム画面に追加」\nAndroidはChromeのメニュー →「ホーム画面に追加」");
};
if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
renderAll();
