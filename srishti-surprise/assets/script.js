// ---------- stars (call on any page with a .stars container) ----------
function paintStars(container, count){
  count = count || 40;
  for(let i=0;i<count;i++){
    const s = document.createElement('span');
    s.style.left = Math.random()*100+'%';
    s.style.top = Math.random()*100+'%';
    s.style.animationDelay = (Math.random()*3)+'s';
    container.appendChild(s);
  }
}

// ---------- confetti engine (shared canvas) ----------
const confettiCanvas = document.getElementById('confetti-canvas');
let confettiCtx, particles = [];
const confettiColors = ['#E76F51','#F2BE49','#74AFA1','#9BC8CC','#fff'];

if(confettiCanvas){
  confettiCtx = confettiCanvas.getContext('2d');
  function resizeCanvas(){ confettiCanvas.width = window.innerWidth; confettiCanvas.height = window.innerHeight; }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function animateConfetti(){
    confettiCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
    particles = particles.filter(p=>p.life < p.maxLife);
    particles.forEach(p=>{
      p.vy += 0.14;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life++;
      const alpha = 1 - (p.life/p.maxLife);
      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rot*Math.PI/180);
      confettiCtx.globalAlpha = Math.max(alpha,0);
      confettiCtx.fillStyle = p.color;
      if(p.shape==='rect'){
        confettiCtx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
      } else {
        confettiCtx.beginPath();
        confettiCtx.arc(0,0,p.size/2,0,Math.PI*2);
        confettiCtx.fill();
      }
      confettiCtx.restore();
    });
    requestAnimationFrame(animateConfetti);
  }
  animateConfetti();
}

function burstConfetti(x, y, count){
  count = count || 140;
  for(let i=0;i<count;i++){
    const angle = Math.random()*Math.PI*2;
    const speed = 3+Math.random()*7;
    particles.push({
      x, y,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed - 4,
      size: 5+Math.random()*5,
      color: confettiColors[Math.floor(Math.random()*confettiColors.length)],
      rot: Math.random()*360,
      vr: (Math.random()-0.5)*12,
      life: 0,
      maxLife: 90+Math.random()*40,
      shape: Math.random()>0.5?'rect':'circle'
    });
  }
}

// ---------- flip cards (memories page) ----------
document.addEventListener('DOMContentLoaded', ()=>{
  let installPrompt;
  const installButton = document.getElementById('installAppBtn');
  window.addEventListener('beforeinstallprompt', event=>{
    event.preventDefault();
    installPrompt = event;
    if(installButton) installButton.hidden = false;
  });

  if(installButton){
    installButton.addEventListener('click', async ()=>{
      if(!installPrompt) return;
      installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      installButton.hidden = true;
    });
  }

  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
  }

  document.querySelectorAll('.flip-card').forEach(card=>{
    card.addEventListener('click', ()=> card.classList.toggle('flipped'));
  });

  // ---------- wish jar (home page) ----------
  const jarWrap = document.getElementById('jarWrap');
  if(jarWrap){
    function openJar(){
      if(jarWrap.classList.contains('opened')) return;
      jarWrap.classList.add('opened');
      const rect = jarWrap.getBoundingClientRect();
      burstConfetti(rect.left+rect.width/2, rect.top+rect.height/2, 130);
    }
    jarWrap.addEventListener('click', openJar);
    jarWrap.addEventListener('keydown', e=>{
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openJar(); }
    });
  }

  // ---------- balloons (surprise page) ----------
  document.querySelectorAll('.balloon').forEach(balloon=>{
    balloon.addEventListener('click', ()=>{
      if(balloon.classList.contains('popped')) return;
      balloon.classList.add('popped');
      const rect = balloon.getBoundingClientRect();
      burstConfetti(rect.left+rect.width/2, rect.top+rect.height/2, 60);
      const msgId = balloon.getAttribute('data-msg');
      const msgEl = document.getElementById(msgId);
      if(msgEl) msgEl.classList.add('show');
    });
  });

  // ---------- replay button (finale page) ----------
  const replayBtn = document.getElementById('replayBtn');
  if(replayBtn){
    replayBtn.addEventListener('click', ()=>{
      burstConfetti(window.innerWidth/2, window.innerHeight*0.4, 220);
      burstConfetti(window.innerWidth*0.2, window.innerHeight*0.6, 100);
      burstConfetti(window.innerWidth*0.8, window.innerHeight*0.6, 100);
    });
  }
});
