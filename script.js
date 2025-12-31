let runs=0, wickets=0, balls=0;
let lastSix=[], overRuns=[];
let totalBalls=120;

const saved = JSON.parse(localStorage.getItem("rcbMatch"));
if(saved){
  ({runs,wickets,balls,lastSix,overRuns,totalBalls}=saved);
  target.value=saved.target||"";
}

function save(){
  localStorage.setItem("rcbMatch",JSON.stringify({
    runs,wickets,balls,lastSix,overRuns,totalBalls,target:target.value
  }));
}

function setOvers(o){
  totalBalls=o*6;
  document.querySelectorAll(".match-type button")
    .forEach(b=>b.classList.remove("active"));
  event.target.classList.add("active");
  update(); save();
}

function addRun(r){
  runs+=r; balls++;
  recordBall(r);
  update(); save();
}

function addWicket(){
  wickets++; balls++;
  recordBall("W");
  update(); save();
}

function recordBall(v){
  if(balls%6===1) overRuns.push(0);
  if(v!=="W") overRuns[overRuns.length-1]+=v;
  lastSix.push(v);
  if(lastSix.length>6) lastSix.shift();
  renderLastBalls(); drawGraph();
}

function renderLastBalls(){
  lastBalls.innerHTML="";
  lastSix.forEach(b=>{
    const d=document.createElement("div");
    d.className="ball"+(b==="W"?" w":"");
    d.innerText=b;
    d.style.color =
      b==="W"?"#ff1744":b===6?"#ffea00":b===4?"#00e676":"#fff";
    lastBalls.appendChild(d);
  });
}

function drawGraph(){
  const c=overGraph,x=c.getContext("2d");
  x.clearRect(0,0,c.width,c.height);
  const max=Math.max(...overRuns,6);
  const w=c.width/Math.max(overRuns.length,1);
  overRuns.forEach((r,i)=>{
    const h=(r/max)*(c.height-20);
    x.fillStyle="#ff1744";
    x.fillRect(i*w+4,c.height-h,w-8,h);
  });
}

function update(){
  runsEl.innerText=runs;
  wicketsEl.innerText=wickets;
  overs.innerText=`${Math.floor(balls/6)}.${balls%6}`;
  runrate.innerText=balls?(runs/(balls/6)).toFixed(2):"0.00";

  const t=+target.value;
  const bl=totalBalls-balls;
  const req=t&&bl>0?((t-runs)/(bl/6)).toFixed(2):"0.00";
  reqrate.innerText=req;

  const p=t?Math.min((runs/t)*100,100):0;
  chaseFill.style.width=p+"%";
  chasePercent.innerText=p.toFixed(1)+"%";
  chaseFill.style.background=req>10
    ?"linear-gradient(90deg,#ff1744,#b71c1c)"
    :"linear-gradient(90deg,#ff1744,#ffea00)";

  const win=t?Math.max(5,Math.min(95,100-req*10)):50;
  winFill.style.width=win+"%";
  winPercent.innerText=win.toFixed(0)+"%";

  scoreAnim.style.animation="none";
  scoreAnim.offsetHeight;
  scoreAnim.style.animation="pop 0.2s ease";
}

function resetMatch(){
  if(!confirm("Reset match?"))return;
  runs=wickets=balls=0; lastSix=[]; overRuns=[];
  localStorage.removeItem("rcbMatch");
  update(); renderLastBalls(); drawGraph();
}

update();

if("serviceWorker"in navigator){
  navigator.serviceWorker.register("service-worker.js");
}
