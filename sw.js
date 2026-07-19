:root {
  --bg:#050505; --panel:#101113; --cyan:#00e9f2; --pink:#ff1493;
  --yellow:#f7e316; --white:#f7f7f2; --muted:#9c9ca2;
}
* { box-sizing:border-box; }
html { background:#000; scroll-behavior:smooth; }
body {
  margin:0; color:var(--white); background:
    radial-gradient(circle at 12% 11%, rgba(0,233,242,.08), transparent 21rem),
    radial-gradient(circle at 88% 42%, rgba(255,20,147,.075), transparent 25rem),
    #050505;
  font-family:Impact, Haettenschweiler, "Arial Narrow Bold", "Noto Sans JP", sans-serif;
  min-height:100vh; overflow-x:hidden;
}
button, a { -webkit-tap-highlight-color:transparent; }
button { font:inherit; color:inherit; }
.noise {
  position:fixed; inset:0; pointer-events:none; opacity:.11; z-index:30;
  background-image:
   repeating-linear-gradient(13deg, transparent 0 3px, rgba(255,255,255,.08) 4px, transparent 5px 9px),
   repeating-linear-gradient(103deg, transparent 0 8px, rgba(0,0,0,.5) 9px 10px);
  mix-blend-mode:overlay;
}
.app-shell { width:min(100%, 1060px); margin:auto; padding:0 24px 64px; position:relative; }
.hero { min-height:250px; display:grid; place-items:center; position:relative; padding:14px 195px 18px; border-bottom:3px solid var(--pink); }
.hero::after { content:""; position:absolute; bottom:-8px; left:9%; right:9%; height:2px; background:var(--pink); opacity:.55; filter:blur(3px); }
.brand-logo { width:min(100%, 620px); height:auto; display:block; filter:drop-shadow(0 4px 0 #000); }
.app-name { margin:-12px 0 0; letter-spacing:.08em; font:900 clamp(24px,3.2vw,38px)/1.1 "Noto Sans JP",Arial,sans-serif; color:#fff; transform:rotate(-1deg); text-shadow:2px 2px #555; }
.round-button {
  position:absolute; top:53px; width:112px; height:112px; border:4px solid currentColor; border-radius:24px;
  background:#070709; display:grid; place-content:center; cursor:pointer; box-shadow:0 0 0 4px #000,0 0 24px currentColor;
}
.round-button::after { content:""; position:absolute; inset:-27px; z-index:-1; background:currentColor; opacity:.85; clip-path:polygon(48% 0,54% 25%,64% 5%,66% 28%,84% 13%,78% 35%,100% 31%,80% 46%,98% 55%,76% 58%,91% 80%,67% 69%,65% 100%,53% 76%,43% 98%,39% 72%,18% 87%,28% 63%,0 65%,24% 51%,4% 38%,28% 38%,17% 13%,40% 29%); }
.round-button:active,.quick-card:active,.schedule-card:active { transform:scale(.96); }
.menu-button { left:28px; color:var(--pink); gap:10px; }
.menu-button span { display:block; width:46px; height:7px; border-radius:6px; background:#fff; box-shadow:0 0 5px #fff; }
.add-button { right:28px; color:var(--pink); font:200 78px/1 Arial,sans-serif; padding:0 0 9px; }
.countdowns { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin:28px 0 38px; }
.countdown { min-height:264px; position:relative; overflow:hidden; padding:20px 24px; background:#050607; border:2px solid currentColor; border-radius:18px; box-shadow:0 0 9px currentColor,inset 0 0 18px rgba(255,255,255,.04); }
.countdown::before { content:""; position:absolute; inset:0; opacity:.35; background:radial-gradient(circle at 15% 20%,currentColor 0 1px,transparent 2px),repeating-linear-gradient(105deg,transparent 0 17px,color-mix(in srgb,currentColor 12%,transparent) 18px,transparent 19px 32px); }
.count-copy { position:relative; z-index:2; }
.countdown p { margin:0 0 10px; color:currentColor; letter-spacing:.04em; font-size:43px; }
.countdown b { display:block; color:#fff; font:900 27px/1.2 "Noto Sans JP",Arial,sans-serif; }
.countdown strong { display:block; line-height:.95; font-family:"Noto Sans JP",Arial,sans-serif; font-size:48px; }
.countdown strong span { font:900 104px/.9 Impact,sans-serif; margin-right:8px; }
.drum-art { position:absolute; right:-5px; bottom:-9px; width:53%; height:75%; opacity:.9; }
.drum { position:absolute; display:block; border:5px solid currentColor; border-radius:50%; }
.drum.big { width:110px;height:110px;right:36px;bottom:6px; }.drum.left { width:66px;height:52px;left:10px;top:57px; }.drum.right { width:70px;height:55px;right:12px;top:45px; }
.cymbal { position:absolute; display:block; width:72px;height:7px;background:currentColor;border-radius:50%; }.cymbal.one { left:0;top:28px;transform:rotate(9deg); }.cymbal.two { right:0;top:18px;transform:rotate(-8deg); }
.crowd-art { position:absolute; right:-13px; bottom:19px; font:900 33px/1 Arial,sans-serif; color:currentColor; transform:rotate(-7deg); opacity:.85; white-space:nowrap; letter-spacing:-.12em; }
.cyan { color:var(--cyan); }.pink { color:var(--pink); }
.section-title { display:flex; align-items:end; gap:12px; margin:0 0 17px; border:0; padding:0 0 0 48px; position:relative; }
.section-title::before { content:""; position:absolute; left:12px; width:14px; height:43px; background:var(--pink); transform:skew(-16deg); }
.section-title span { color:#fff; font-family:"Noto Sans JP",Arial,sans-serif; font-weight:900; font-size:34px; letter-spacing:.02em; }
.section-title b { color:#ddd; font:700 12px Arial,sans-serif; letter-spacing:.08em; padding-bottom:3px; }
.schedule-list { display:grid; gap:11px; }
.schedule-card {
  width:100%; min-height:158px; border:2px solid #656568; border-radius:17px; background:
   linear-gradient(100deg,rgba(255,255,255,.04),transparent 48%),#070708;
  display:grid; grid-template-columns:230px 1fr 48px; align-items:center; padding:0 19px 0 0; text-align:left; cursor:pointer; position:relative; overflow:hidden;
  transition:.18s ease; box-shadow:inset 0 1px rgba(255,255,255,.04);
}
.schedule-card:hover { border-color:currentColor; box-shadow:0 0 17px color-mix(in srgb,currentColor 35%,transparent); }
.schedule-card::before { content:""; position:absolute; inset:0 auto 0 0; width:48px; opacity:.8; background:currentColor; clip-path:polygon(0 0,55% 0,33% 13%,80% 24%,37% 37%,87% 53%,40% 65%,78% 80%,31% 89%,61% 100%,0 100%); }
.schedule-card.studio { color:var(--cyan); }.schedule-card.live { color:var(--pink); }.schedule-card.event { color:var(--yellow); }
.date { height:77%; border-right:2px solid #555; display:grid; place-content:center; text-align:center; color:#fff; }
.date strong { font:900 55px/.95 Impact,Arial,sans-serif; letter-spacing:.03em; }
.date small { font:900 26px/1.1 "Noto Sans JP",Arial,sans-serif; color:#fff; margin-top:14px; }
.schedule-copy { padding:17px 32px; min-width:0; display:grid; grid-template-columns:max-content 1fr; align-items:center; gap:12px 32px; }
.schedule-copy .type { display:block; width:132px; text-align:center; color:currentColor; background:transparent!important; border:2px solid currentColor; border-radius:3px; padding:8px; font:900 19px Arial,sans-serif; letter-spacing:.06em; transform:none; }
.schedule-copy strong { display:block; color:#fff; font-family:"Noto Sans JP",Arial,sans-serif; font-size:30px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.schedule-copy small { grid-column:1/-1; color:#eee; font:700 21px "Noto Sans JP",Arial,sans-serif; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.clock { color:#fff;font-style:normal;font-size:30px; }.pin { color:var(--pink);font-style:normal; }
.arrow { color:#fff; font:300 62px Arial,sans-serif; text-align:center; text-shadow:none; }
.quick-section { margin-top:34px; }
.quick-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
.quick-card {
  aspect-ratio:1.08; min-width:0; position:relative; overflow:hidden; border:2px solid currentColor; border-radius:14px;
  background:#050607; cursor:pointer; text-align:center; padding:16px; isolation:isolate; box-shadow:0 0 10px color-mix(in srgb,currentColor 32%,transparent),inset 0 0 30px rgba(0,0,0,.8);
}
.quick-card::before { content:""; position:absolute; inset:0; z-index:-1; opacity:.42; background:repeating-radial-gradient(circle at 10% 20%,currentColor 0 1px,transparent 2px 14px); }
.quick-card::after { content:""; position:absolute; inset:0; z-index:-1; border:17px solid currentColor; opacity:.36; clip-path:polygon(0 0,18% 0,12% 7%,22% 12%,8% 18%,20% 27%,7% 39%,20% 48%,8% 60%,19% 72%,5% 82%,18% 100%,0 100%); }
.splatter { position:absolute; width:7px; height:7px; border-radius:50%; background:currentColor; left:15%; top:13%; box-shadow:28px -6px 0 -1px currentColor,55px 8px 0 1px currentColor,95px -4px 0 -2px currentColor,132px 11px 0 -1px currentColor,158px 45px 0 -2px currentColor,20px 78px 0 -2px currentColor; }
.q-cyan { color:var(--cyan); }.q-pink { color:var(--pink); }.q-yellow { color:var(--yellow); }
.quick-icon { margin:10px auto 0; display:grid; place-items:center; position:relative; color:currentColor; font:900 clamp(82px,9vw,120px)/.9 Arial,sans-serif; }
.quick-icon.calendar { width:106px;height:104px;border:10px solid currentColor;border-radius:8px;margin-top:9px; }
.quick-icon.calendar::before,.quick-icon.calendar::after { content:""; position:absolute; top:-24px;width:12px;height:28px;border-radius:6px;background:currentColor; }.quick-icon.calendar::before{left:17px}.quick-icon.calendar::after{right:17px}
.quick-icon.calendar i { font-style:normal;font-size:58px; }
.quick-icon.check { font-size:140px; line-height:.72; }
.quick-icon.shirt { width:128px; height:98px; color:#050505; background:currentColor; clip-path:polygon(22% 0,38% 0,42% 14%,58% 14%,62% 0,78% 0,100% 22%,80% 38%,75% 30%,75% 100%,25% 100%,25% 30%,20% 38%,0 22%); font-size:67px; }
.quick-card strong { position:absolute; left:10px; right:10px; bottom:67px; color:#fff; font-family:"Noto Sans JP",Arial,sans-serif; font-size:clamp(18px,2.2vw,27px); line-height:1.2; text-shadow:2px 2px #000; }
.mini-arrow { position:absolute; left:50%; bottom:13px; transform:translateX(-50%); width:55px; height:55px; display:grid; place-items:center; border-radius:50%; background:#050505; border:2px solid currentColor; font:300 47px/1 Arial,sans-serif; padding-bottom:7px; }
.sheet-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.75); z-index:40; }
.side-sheet { position:fixed; z-index:50; inset:0 auto 0 0; width:min(82vw,330px); background:#09090b; border-right:2px solid var(--cyan); padding:70px 28px; transform:translateX(-105%); transition:.25s ease; box-shadow:10px 0 30px #000; }
.side-sheet.open { transform:none; }
.side-sheet img { width:100%; margin-bottom:35px; }
.side-sheet a { display:block; color:#fff; text-decoration:none; border-bottom:1px solid #333; padding:15px 5px; font-family:"Noto Sans JP",Arial,sans-serif; font-weight:700; }
.sheet-close { position:absolute; right:16px; top:16px; border:0; background:none; font-size:34px; cursor:pointer; }
.add-popover { position:fixed; z-index:45; right:max(20px,calc((100vw - 1040px)/2 + 25px)); top:98px; width:220px; padding:15px; background:#0c0c0e; border:1px solid var(--pink); box-shadow:0 0 25px rgba(255,20,147,.4); }
.add-popover p { color:var(--pink); margin:0 0 8px; letter-spacing:.12em; }
.add-popover button { display:block; width:100%; border:0; border-top:1px solid #333; background:none; text-align:left; padding:12px 4px; cursor:pointer; font-family:"Noto Sans JP",Arial,sans-serif; }
.toast { position:fixed; left:50%; bottom:24px; transform:translate(-50%,20px); opacity:0; z-index:60; background:#fff; color:#080808; padding:10px 18px; font-family:"Noto Sans JP",Arial,sans-serif; font-weight:700; transition:.2s; pointer-events:none; }
.toast.show { opacity:1; transform:translate(-50%,0); }
@media (max-width:600px) {
  .app-shell { padding:0 10px 42px; }
  .hero { min-height:152px; padding:12px 64px 10px; }
  .brand-logo { width:100%; }
  .app-name { margin:-2px 0 0; font-size:17px; letter-spacing:.03em; }
  .round-button { width:52px; height:52px; top:31px; border-radius:12px; border-width:2px; }
  .round-button::after { inset:-12px; }.menu-button{left:4px;gap:5px}.add-button{right:4px}
  .menu-button span { width:25px;height:4px; }.add-button { font-size:39px;padding-bottom:4px; }
  .countdowns { gap:9px; margin:16px 0 25px; }
  .countdown { min-height:145px; padding:10px 11px; border-radius:10px; }
  .countdown p { font-size:20px;margin-bottom:6px; }.countdown b { font-size:13px; }.countdown strong { font-size:22px; }.countdown strong span { font-size:58px;margin-right:3px; }
  .drum-art { transform:scale(.55); transform-origin:right bottom; width:80%; }.crowd-art{font-size:17px;right:-4px;bottom:12px}
  .section-title { margin-bottom:10px;padding-left:30px; }.section-title::before{left:7px;width:9px;height:28px}.section-title span { font-size:22px; }
  .schedule-list { gap:8px; }
  .schedule-card { min-height:104px; grid-template-columns:91px 1fr 24px; padding-right:6px;border-radius:9px;border-width:1px; }
  .schedule-card::before{width:20px}.date{height:75%;border-right-width:1px}.date strong { font-size:31px; }.date small { font-size:14px;margin-top:7px; }
  .schedule-copy { padding:9px 10px;grid-template-columns:69px 1fr;gap:7px 9px}.schedule-copy strong { font-size:15px; }.schedule-copy small { font-size:9.4px; }.schedule-copy .type { width:69px;font-size:9px;padding:4px;border-width:1px; }
  .clock{font-size:15px}.arrow { font-size:35px; }
  .quick-section { margin-top:26px; }
  .quick-grid { gap:6px; }
  .quick-card { aspect-ratio:.94; padding:5px; border-width:1px;border-radius:7px; }
  .quick-icon.calendar{width:53px;height:53px;border-width:5px}.quick-icon.calendar::before,.quick-icon.calendar::after{top:-12px;width:6px;height:14px}.quick-icon.calendar::before{left:8px}.quick-icon.calendar::after{right:8px}.quick-icon.calendar i{font-size:28px}
  .quick-icon.check { font-size:71px;margin-top:10px; }.quick-icon.shirt { width:65px;height:52px;font-size:34px;margin-top:15px; }
  .quick-card strong { left:3px; right:3px; bottom:36px; font-size:10px; line-height:1.18; white-space:nowrap; }
  .mini-arrow { width:28px; height:28px; bottom:6px; font-size:25px;padding-bottom:4px; }
  .splatter { transform:scale(.65); transform-origin:left top; }
}
@media (max-width:350px) {
  .quick-card strong { font-size:9px; letter-spacing:-.03em; }
  .countdown strong span { font-size:31px; }
}
@media (prefers-reduced-motion:reduce) { * { scroll-behavior:auto!important; transition:none!important; } }
