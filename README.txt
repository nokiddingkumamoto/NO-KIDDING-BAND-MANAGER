:root { color-scheme:dark; --pink:#ff0079; --cyan:#00c7f2; }
* { box-sizing:border-box; }
html,body { margin:0; min-height:100%; background:#000; }
body { overflow-x:hidden; font-family:"Noto Sans JP",Arial,sans-serif; }
.visual-page {
  position:relative;
  width:min(100%,1024px,calc(100svh * .6667));
  margin:0 auto;
  line-height:0;
  background:#000;
}
.visual-page > img { display:block; width:100%; height:auto; user-select:none; -webkit-user-drag:none; }
.hotspot { position:absolute; display:block; margin:0; padding:0; border:0; background:transparent; cursor:pointer; border-radius:12px; color:transparent; }
.hotspot:focus-visible { outline:3px solid #fff; outline-offset:-4px; box-shadow:0 0 18px #fff; }
.hotspot:active { background:rgba(255,255,255,.09); transform:scale(.985); }
.menu-button { left:4.1%; top:3.2%; width:13.5%; height:9.5%; }
.add-button { left:82.5%; top:3.2%; width:13.5%; height:9.5%; }
.schedule-one { left:2.9%; top:42.4%; width:94.2%; height:9.8%; }
.schedule-two { left:2.9%; top:53.2%; width:94.2%; height:9.8%; }
.schedule-three { left:2.9%; top:64.0%; width:94.2%; height:10.0%; }
.quick-schedule { left:2.9%; top:79.9%; width:30.4%; height:17.3%; }
.quick-studio { left:34.8%; top:79.9%; width:30.3%; height:17.3%; }
.quick-merch { left:66.7%; top:79.9%; width:30.4%; height:17.3%; }
.sheet-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.78); z-index:40; }
.side-sheet { position:fixed; z-index:50; inset:0 auto 0 0; width:min(82vw,340px); background:#08080a; border-right:2px solid var(--cyan); padding:72px 28px; transform:translateX(-105%); transition:.25s ease; box-shadow:10px 0 30px #000; }
.side-sheet.open { transform:none; }
.side-sheet img { width:100%; margin-bottom:34px; }
.side-sheet a { display:block; color:#fff; text-decoration:none; border-bottom:1px solid #333; padding:16px 5px; font-weight:800; }
.sheet-close { position:absolute; right:16px; top:15px; color:#fff; border:0; background:none; font-size:36px; cursor:pointer; }
.add-popover { position:fixed; z-index:45; right:max(16px,calc((100vw - 1024px)/2 + 25px)); top:13%; width:220px; padding:15px; background:#0c0c0e; border:1px solid var(--pink); box-shadow:0 0 25px rgba(255,0,121,.45); }
.add-popover p { color:var(--pink); margin:0 0 8px; font-weight:900; letter-spacing:.12em; }
.add-popover button { display:block; width:100%; color:#fff; border:0; border-top:1px solid #333; background:none; text-align:left; padding:12px 4px; cursor:pointer; font-weight:700; }
.toast { position:fixed; left:50%; bottom:24px; transform:translate(-50%,20px); opacity:0; z-index:60; background:#fff; color:#080808; padding:10px 18px; font-weight:700; transition:.2s; pointer-events:none; white-space:nowrap; }
.toast.show { opacity:1; transform:translate(-50%,0); }
@media (max-width:600px) {
  .hotspot { border-radius:6px; }
  .add-popover { top:74px; right:10px; width:200px; }
  .toast { max-width:92vw; font-size:12px; }
}
@media (prefers-reduced-motion:reduce) { * { transition:none!important; } }
