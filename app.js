/* SYSTEM AWAKENING — BETA 1.5. Dados ficam neste navegador. */
(() => {
  "use strict";
  const KEY = "systemAwakeningBeta15";
  const $ = (id) => document.getElementById(id);
  const today = () => new Date().toLocaleDateString("en-CA");
  const dateLabel = (d = new Date()) => d.toLocaleDateString("pt-BR", {day:"2-digit",month:"2-digit",year:"numeric"});
  const defaultQuests = [
    {id:"water", title:"Hidratação consciente", desc:"Beber água ao longo do dia, ajustando à sede e às suas necessidades.", xp:15},
    {id:"steps", title:"Movimentar o corpo", desc:"Buscar movimento possível; 8.000 passos é uma meta opcional, não obrigatória.", xp:20},
    {id:"training", title:"Treino ou mobilidade", desc:"Até 30 minutos, adaptando intensidade e pausando se necessário.", xp:25},
    {id:"sugar", title:"Escolha alimentar consciente", desc:"Fazer escolhas equilibradas; não é necessário proibir açúcar nem alimentos.", xp:15},
    {id:"sleep", title:"Preparar o descanso", desc:"Criar oportunidade para dormir o suficiente para sua idade.", xp:20}
  ];
  const freshState = () => ({
    profile:{name:"JOGADOR",height:180,goalWeight:75,weight:82},
    level:1,xp:0,coins:0,day:today(),quests:defaultQuests.map(q=>({...q,done:false,claimed:false})),
    weights:[{date:today(),weight:82}], rewards:[], exercises:{}, lastPenaltyDay:"", workouts:0
  });
  let state;
  try { state = JSON.parse(localStorage.getItem(KEY)) || freshState(); } catch { state = freshState(); }
  function save(){ localStorage.setItem(KEY,JSON.stringify(state)); }
  function toast(message){ const t=$("toast"); t.textContent=message; t.classList.add("show"); clearTimeout(toast.timer); toast.timer=setTimeout(()=>t.classList.remove("show"),2400); }
  function levelNeed(level=state.level){return 100+(level-1)*25;}
  function addXP(amount, source="missão"){
    state.xp += amount; state.coins += Math.max(1,Math.round(amount/5));
    let leveled=false;
    while(state.xp>=levelNeed()){state.xp-=levelNeed();state.level++;leveled=true;}
    save(); renderStatus(); renderInventory();
    if(leveled){$("levelUpText").textContent=`NÍVEL ${state.level} ALCANÇADO`; $("levelOverlay").hidden=false; document.body.classList.add("level-flash"); setTimeout(()=>document.body.classList.remove("level-flash"),800); playLevelSound();}
    else toast(`+${amount} XP · ${source}`);
  }
  function playLevelSound(){
    try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=new C(),o=c.createOscillator(),g=c.createGain();o.type="sawtooth";o.frequency.setValueAtTime(440,c.currentTime);o.frequency.exponentialRampToValueAtTime(880,c.currentTime+.22);o.frequency.exponentialRampToValueAtTime(660,c.currentTime+.5);g.gain.setValueAtTime(.08,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.55);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.56);}catch{}
  }
  function ensureDay(){
    const t=today();
    if(state.day!==t){
      const missed=state.quests.some(q=>!q.done);
      state.day=t;state.quests=defaultQuests.map(q=>({...q,done:false,claimed:false}));
      if(missed)state.lastPenaltyDay=t;
      save();
    }
  }
  function switchTab(tab){
    document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
    document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id==="view-"+tab));
  }
  function renderStatus(){
    $("playerNameText").textContent=state.profile.name;
    $("rankBadge").textContent="RANK "+(state.level>=30?"S":state.level>=20?"A":state.level>=12?"B":state.level>=7?"C":state.level>=3?"D":"E");
    $("levelText").textContent=state.level;$("xpText").textContent=state.xp;$("nextXpText").textContent=levelNeed();
    $("xpFill").style.width=Math.min(100,state.xp/levelNeed()*100)+"%";
    $("weightText").textContent=Number(state.profile.weight).toLocaleString("pt-BR",{minimumFractionDigits:1,maximumFractionDigits:1});
    $("goalWeightText").textContent=Number(state.profile.goalWeight).toLocaleString("pt-BR",{minimumFractionDigits:1,maximumFractionDigits:1});
    $("heightText").textContent=state.profile.height;
    const bmi=Number(state.profile.weight)/(Number(state.profile.height)/100)**2;
    $("bmiText").textContent=Number.isFinite(bmi)?bmi.toLocaleString("pt-BR",{minimumFractionDigits:1,maximumFractionDigits:1}):"—";
    $("bmiLabel").textContent="Indicador limitado; para menores de 18 anos usa-se avaliação por idade";
    $("coinText").textContent=state.coins;
    $("todayLabel").textContent=dateLabel();
    $("questDate").textContent=dateLabel();
    const done=state.quests.filter(q=>q.done).length;
    $("questProgressText").textContent=`${done} / ${state.quests.length}`;
    $("questProgressFill").style.width=(done/state.quests.length*100)+"%";
    $("penaltyCard").hidden=state.lastPenaltyDay!==today();
    renderQuests();
  }
  function questHTML(q){
    return `<label class="quest-item ${q.done?"done":""}"><input class="quest-check" type="checkbox" data-quest="${q.id}" ${q.done?"checked":""}><span class="quest-copy"><b>${escapeHTML(q.title)}</b><small>${escapeHTML(q.desc)}</small></span><span class="xp-chip">${q.done?"✓ FEITA":`+${q.xp} XP`}</span></label>`;
  }
  function renderQuests(){
    $("questList").innerHTML=state.quests.map(questHTML).join("");
    $("dailyPreview").innerHTML=state.quests.slice(0,3).map(questHTML).join("");
    document.querySelectorAll("[data-quest]").forEach(input=>input.addEventListener("change",()=>{
      const q=state.quests.find(x=>x.id===input.dataset.quest); if(!q)return;
      if(input.checked&&!q.done){q.done=true;q.claimed=true;save();addXP(q.xp,q.title);renderStatus();}
      else if(!input.checked&&q.done){q.done=false;save();renderStatus();toast("Missão desmarcada.");}
    }));
  }
  function renderWeights(){
    const hist=[...state.weights].sort((a,b)=>a.date.localeCompare(b.date));
    $("weightHistory").innerHTML=hist.slice().reverse().slice(0,10).map(w=>`<div class="history-row"><span>${escapeHTML(w.date)}</span><b>${Number(w.weight).toLocaleString("pt-BR",{minimumFractionDigits:1})} kg</b></div>`).join("")||'<div class="empty-state">Nenhum registro ainda.</div>';
    const chart=$("weightChart");
    if(!hist.length){chart.innerHTML='<div class="empty-state">Registre seu peso para criar o gráfico.</div>';return;}
    const vals=hist.map(x=>Number(x.weight)),min=Math.min(...vals),max=Math.max(...vals),range=max-min||1;
    chart.innerHTML=hist.slice(-14).map(w=>{const h=25+((Number(w.weight)-min)/range)*75;return `<div class="chart-col"><span class="chart-val">${Number(w.weight).toLocaleString("pt-BR",{maximumFractionDigits:1})}</span><div class="chart-bar" style="height:${h}%"></div><span class="chart-date">${escapeHTML(w.date.slice(5).replace("-","/"))}</span></div>`;}).join("");
  }
  function renderInventory(){
    $("coinText").textContent=state.coins;
    $("rewardList").innerHTML=state.rewards.length?state.rewards.map(r=>`<article class="panel reward-card"><div class="reward-copy"><b>${escapeHTML(r.name)}</b><small>🪙 ${r.cost} moedas</small></div><button data-buy="${r.id}">RESGATAR</button><button data-delete="${r.id}" aria-label="Excluir recompensa">✕</button></article>`).join(""):'<div class="empty-state panel" style="padding:22px">Nenhuma recompensa criada. Adicione sua primeira recompensa acima.</div>';
    document.querySelectorAll("[data-buy]").forEach(b=>b.addEventListener("click",()=>{const r=state.rewards.find(x=>x.id===b.dataset.buy);if(!r)return;if(state.coins<r.cost){toast("Moedas insuficientes.");return;}state.coins-=r.cost;save();renderInventory();toast("Recompensa resgatada! Aproveite.");}));
    document.querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",()=>{state.rewards=state.rewards.filter(x=>x.id!==b.dataset.delete);save();renderInventory();}));
  }
  function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>switchTab(b.dataset.tab)));
  document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>switchTab(b.dataset.goto)));
  $("quickQuestBtn").addEventListener("click",()=>switchTab("quests"));
  $("editProfileBtn").addEventListener("click",()=>{
    const name=prompt("Nome do caçador:",state.profile.name);if(name===null)return;
    const weight=prompt("Peso atual em kg:",state.profile.weight);if(weight===null)return;
    const goal=prompt("Meta de peso em kg (opcional):",state.profile.goalWeight);if(goal===null)return;
    const height=prompt("Altura em cm:",state.profile.height);if(height===null)return;
    if(!name.trim()||![Number(weight),Number(goal),Number(height)].every(Number.isFinite)||Number(weight)<20||Number(weight)>350||Number(goal)<20||Number(goal)>350||Number(height)<100||Number(height)>230){toast("Confira os valores e tente novamente.");return;}
    state.profile={...state.profile,name:name.trim().slice(0,32),weight:Number(weight),goalWeight:Number(goal),height:Number(height)};save();renderStatus();toast("Ficha atualizada.");
  });
  $("addWeightBtn").addEventListener("click",()=>{const w=prompt("Qual é o peso de hoje (kg)?",state.profile.weight);if(w===null)return;saveWeight(w);});
  function saveWeight(value){
    const n=Number(value);if(!Number.isFinite(n)||n<20||n>350){toast("Digite um peso válido.");return;}
    state.profile.weight=n;const t=today();const existing=state.weights.find(w=>w.date===t);
    if(existing)existing.weight=n;else state.weights.push({date:t,weight:n});
    save();renderStatus();renderWeights();$("calWeightInput").value=n;toast("Peso registrado.");
  }
  $("editHeightBtn").addEventListener("click",()=>{const h=prompt("Altura em centímetros:",state.profile.height);if(h===null)return;const n=Number(h);if(!Number.isFinite(n)||n<100||n>230){toast("Altura inválida.");return;}state.profile.height=n;save();renderStatus();});
  $("weightForm").addEventListener("submit",e=>{e.preventDefault();saveWeight($("weightInput").value);$("weightInput").value="";});
  $("resetDailyBtn").addEventListener("click",()=>{if(!confirm("Reiniciar as missões de hoje? O XP já ganho não será removido."))return;state.quests=defaultQuests.map(q=>({...q,done:false,claimed:false}));save();renderStatus();toast("Missões reiniciadas.");});
  $("penaltyCompleteBtn").addEventListener("click",()=>{state.lastPenaltyDay="";save();addXP(10,"missão de recuperação");renderStatus();});
  $("finishWorkoutBtn").addEventListener("click",()=>{
    const checked=[...document.querySelectorAll("[data-ex]")].filter(x=>x.checked);
    if(checked.length===0){toast("Marque os exercícios que realizou.");document.body.classList.remove("shake");void document.body.offsetWidth;document.body.classList.add("shake");return;}
    state.workouts++;checked.forEach(x=>state.exercises[x.dataset.ex]=true);save();addXP(30,"treino finalizado");toast("Treino registrado. Respeite seu descanso.");checked.forEach(x=>x.checked=false);
  });
  let timerSec=0,timerInt=null;
  function showTimer(){$("timerText").textContent=String(Math.floor(timerSec/60)).padStart(2,"0")+":"+String(timerSec%60).padStart(2,"0");}
  $("timerStartBtn").addEventListener("click",()=>{if(timerInt)return;timerInt=setInterval(()=>{timerSec++;showTimer();},1000);});
  $("timerPauseBtn").addEventListener("click",()=>{clearInterval(timerInt);timerInt=null;});
  $("timerResetBtn").addEventListener("click",()=>{clearInterval(timerInt);timerInt=null;timerSec=0;showTimer();});
  $("calorieForm").addEventListener("submit",e=>{
    e.preventDefault();const age=Number($("ageInput").value),sex=$("sexInput").value,h=Number($("calHeightInput").value),w=Number($("calWeightInput").value),act=Number($("activityInput").value),out=$("calorieResult");out.hidden=false;
    if(age<18){out.innerHTML="<b>Estimativa não exibida</b><p class='muted small'>Para menores de 18 anos, necessidades energéticas dependem do crescimento. Evite metas restritivas sem orientação de um profissional de saúde.</p>";return;}
    const bmr=10*w+6.25*h-5*age+(sex==="male"?5:-161),tdee=Math.round(bmr*act);
    out.innerHTML=`<span class="muted small">Gasto diário estimado (manutenção)</span><strong>${tdee.toLocaleString("pt-BR")} kcal/dia</strong><span class="muted small">Fórmula aproximada; pode errar bastante. Não é prescrição nem meta automática de emagrecimento.</span>`;
  });
  $("rewardForm").addEventListener("submit",e=>{e.preventDefault();const name=$("rewardNameInput").value.trim(),cost=Number($("rewardCostInput").value);if(!name||!Number.isInteger(cost)||cost<1){toast("Confira nome e custo.");return;}state.rewards.push({id:Date.now().toString(36),name,cost});save();renderInventory();$("rewardNameInput").value="";toast("Recompensa adicionada.");});
  $("exportBtn").addEventListener("click",()=>{
    const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="system-awakening-backup.json";a.click();URL.revokeObjectURL(url);toast("Backup exportado.");
  });
  $("levelCloseBtn").addEventListener("click",()=>$("levelOverlay").hidden=true);
  $("installBtn").addEventListener("click",async()=>{if(window.installPrompt){window.installPrompt.prompt();await window.installPrompt.userChoice;window.installPrompt=null;$("installBtn").hidden=true;}else toast("No Chrome, abra o menu ⋮ e escolha Instalar app ou Adicionar à tela inicial.");});
  window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();window.installPrompt=e;$("installBtn").hidden=false;});
  if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
  ensureDay();renderStatus();renderWeights();renderInventory();showTimer();
  $("calHeightInput").value=state.profile.height;$("calWeightInput").value=state.profile.weight;
})();