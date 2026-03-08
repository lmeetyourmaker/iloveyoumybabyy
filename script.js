const gameContainer = document.getElementById('game-container');
const canvasWrapper = document.getElementById('canvas-wrapper');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const rainCanvas = document.getElementById('rain-canvas');
const rainCtx = rainCanvas.getContext('2d');
const lightningOverlay = document.getElementById('lightning-overlay');

let cw, ch;

function resize() {
    cw = canvas.width = window.innerWidth;
    ch = canvas.height = window.innerHeight;
    rainCanvas.width = cw;
    rainCanvas.height = ch;
}
window.addEventListener('resize', resize);
resize();

// --- BOY PORTRAIT RENDER for UI ---
const boyCanvas = document.getElementById('boy-portrait');
if (boyCanvas) {
    const bCtx = boyCanvas.getContext('2d');
    function renderBoyUI() {
        bCtx.clearRect(0, 0, 80, 80);
        bCtx.save();
        bCtx.translate(20, 20); 
        
        bCtx.fillStyle = '#FFDCB6';
        bCtx.fillRect(15, 30, 10, 10); 
        bCtx.fillRect(0, 0, 40, 35); 
        
        bCtx.fillStyle = '#5c4033'; 
        bCtx.fillRect(-5, -10, 50, 20); 
        bCtx.fillRect(-10, 0, 15, 30); 
        bCtx.fillRect(35, 0, 15, 30); 

        bCtx.fillStyle = '#e84118';
        bCtx.fillRect(-5, -5, 6, 12);
        bCtx.fillRect(12, -10, 8, 8);
        bCtx.fillRect(40, -5, 4, 15);
        
        bCtx.fillStyle = '#5c4033';
        for(let c=0; c<6; c++) { bCtx.fillRect(-5 + (c*8), -15, 8, 8); }
        bCtx.fillRect(-12, 5, 6, 8); bCtx.fillRect(46, 5, 6, 8);
        bCtx.fillRect(-12, 18, 6, 8); bCtx.fillRect(46, 18, 6, 8);
        
        bCtx.fillStyle = '#ffffff'; 
        bCtx.fillRect(8, 15, 6, 6); bCtx.fillRect(26, 15, 6, 6); 
        bCtx.fillStyle = '#8B4513'; 
        bCtx.fillRect(10, 17, 3, 3); bCtx.fillRect(28, 17, 3, 3); 
        
        bCtx.fillStyle = '#000';
        bCtx.fillRect(16, 28, 8, 2); 

        bCtx.restore();
    }
    renderBoyUI();
}

// --- AUDIO SYNTHESIS ---
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playBirdArrive() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.3);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(t); osc.stop(t + 0.4);
}

function playLetterGive() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(t); osc.stop(t + 0.2);
}

function playApplause() {
    if (!audioCtx) return;
    try {
        const duration = 2.5; 
        const bufferSize = audioCtx.sampleRate * duration;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) { data[i] = (Math.random() * 2 - 1) * 0.4; }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass'; filter.frequency.value = 1000; filter.Q.value = 0.5;
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(1, audioCtx.currentTime + duration - 0.5);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
        noise.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
        noise.start();
    } catch(e) {}
}

function playThunder() {
    if (!audioCtx) return;
    try {
        const duration = 3.0;
        const bufferSize = audioCtx.sampleRate * duration;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) { data[i] = (Math.random() * 2 - 1); }
        
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass'; filter.frequency.value = 400; 
        
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        
        noise.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
        noise.start();
    } catch(e){}
}

function playFirework() {
    if (!audioCtx) return;
    try {
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        osc.type = 'sine'; osc.frequency.setValueAtTime(800, t); osc.frequency.exponentialRampToValueAtTime(150, t + 0.5);
        const oscGain = audioCtx.createGain();
        oscGain.gain.setValueAtTime(0, t); oscGain.gain.linearRampToValueAtTime(0.1, t + 0.1); oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
        osc.connect(oscGain); oscGain.connect(audioCtx.destination);
        osc.start(t); osc.stop(t + 0.5);
        
        setTimeout(() => {
            if (!audioCtx) return;
            const expT = audioCtx.currentTime;
            const dur = 0.8;
            const bufferSize = audioCtx.sampleRate * dur;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) { data[i] = (Math.random() * 2 - 1); }
            const noise = audioCtx.createBufferSource(); noise.buffer = buffer;
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass'; filter.frequency.setValueAtTime(1500, expT); filter.frequency.exponentialRampToValueAtTime(50, expT + dur);
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.6, expT); gain.gain.exponentialRampToValueAtTime(0.01, expT + dur);
            noise.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
            noise.start(expT);
        }, 450);
    } catch(e) {}
}

function playFailSound() {
    if (!audioCtx) return;
    try {
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        osc.type = 'square'; osc.frequency.setValueAtTime(150, t); osc.frequency.linearRampToValueAtTime(40, t + 0.4);
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.1, t); gain.gain.linearRampToValueAtTime(0, t + 0.4);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(t); osc.stop(t + 0.4);
    } catch(e) {}
}

// --- GAME LOGIC STATES ---
const STATE_START = 0;
const STATE_PLAYING = 1;
const STATE_PAUSED = 2;
const STATE_FAIL = 3;
const STATE_CASTLE = 4;
const STATE_ANIMATION = 5;
const STATE_WIN = 6;
const STATE_LETTER_READ = 7;

let gameState = STATE_START;

// Gravity and Jump settings
let gravity = 0.4;
let velocity = 0;
let jumpStrength = -7;

const bird = { x: cw/4, y: ch/2, w: 55, h: 35, flapFrame: 0, hasLetter: true };
let letterItem = { active: false, x: 0, y: 0, w: 20, h: 14, targetX: 0, targetY: 0, progress: 0, giveSoundPlayed: false };

let pipes = [];
const pipeWidth = 80;
const pipeGap = 220;
let pipeSpeed = 5;
let frameCount = 0;
let score = 0;
const targetScore = 25; // 25 pipes
let pipesSpawnedCount = 0; 
let motivationTimer = 0; // Timer to hide boy

let bgOffset = 0;

let clouds = [];
function initClouds() {
    clouds = [];
    for(let i=0; i<8; i++) {
        clouds.push({ x: Math.random() * cw, y: Math.random() * (ch/2), s: Math.random() * 0.5 + 0.5, v: Math.random() * 1 + 0.2 });
    }
}
initClouds();

let mountains = [];
function initMountains() {
    mountains = [];
    for(let i=0; i<15; i++) {
        let h = Math.random() * 200 + 150;
        let w = Math.random() * 300 + 200;
        mountains.push({
            x: i * (w * 0.6) - 100,
            y: ch - 100, // Ground level is at ch - 100
            w: w,
            h: h,
            colorBase: `rgb(${Math.floor(Math.random()*20 + 80)}, ${Math.floor(Math.random()*30 + 130)}, ${Math.floor(Math.random()*20 + 80)})`
        });
    }
}
initMountains();

let raindrops = [];
function initRain() {
    raindrops = [];
    for(let i=0; i<300; i++) {
        raindrops.push({ x: Math.random() * cw, y: Math.random() * ch, l: Math.random() * 20 + 10, v: Math.random() * 20 + 10 });
    }
}
initRain();

let flyingHearts = [];
function spawnHeart() {
    flyingHearts.push({ x: cw + 50, y: Math.random() * (ch - 200), v: Math.random() * 2 + 2, s: Math.random() * 0.5 + 0.5, wobble: Math.random() * Math.PI * 2 });
}

let confetti = [];
function createConfetti() {
    confetti = [];
    for (let i = 0; i < 200; i++) {
        confetti.push({
            x: Math.random() * cw,
            y: Math.random() * (-ch), // Start above screen
            w: Math.random() * 8 + 4,
            h: Math.random() * 8 + 4,
            v: Math.random() * 3 + 2,
            drift: (Math.random() - 0.5) * 2,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 10
        });
    }
}

let castle = {
    x: cw + 200,
    y: 0, 
    w: 500, 
    h: ch, 
    active: false,
    stopped: false
};

let girl = { x: 0, y: 0, state: 'sad', hasLetter: false };
let fireworks = [];

let boy = {
    active: false,
    x: cw / 2, 
    y: -150, 
    targetY: 50, 
    progress: 0,
    messageIndex: 0
};

const motivationalMessages = [
    "Come on, you can do it!",
    "Almost there, my love!",
    "Keep going, don't give up!",
    "You're doing great!",
    "Just a little further!",
    "She is waiting for you!",
    "Bring that letter home!",
    "Stay focused!"
];

// DOM
const startScreen = document.getElementById('start-screen');
if (startScreen) {
    const heartsBg = document.createElement('div');
    heartsBg.className = 'hearts-bg';
    startScreen.insertBefore(heartsBg, startScreen.firstChild);
    
    for (let i = 0; i < 15; i++) {
        let h = document.createElement('div');
        h.innerHTML = '❤️';
        h.className = 'heart-float';
        h.style.left = (Math.random() * 90 + 5) + '%';
        h.style.animationDuration = (Math.random() * 3 + 3) + 's';
        h.style.animationDelay = (Math.random() * 3) + 's';
        h.style.fontSize = (Math.random() * 15 + 10) + 'px';
        heartsBg.appendChild(h);
    }
}
const pauseScreen = document.getElementById('pause-screen');
const failScreen = document.getElementById('fail-screen');
const winScreen = document.getElementById('win-screen');
const letterScreen = document.getElementById('letter-screen'); 

const startBtn = document.getElementById('start-btn');
const failRestartBtn = document.getElementById('fail-restart-btn');
const restartBtn = document.getElementById('restart-btn');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const openLetterBtn = document.getElementById('open-letter-btn');
const bgMusic = document.getElementById('bg-music');

const hud = document.getElementById('hud');
const scoreVal = document.getElementById('score-val');
const flashOverlay = document.getElementById('flash-overlay');

// Ensure background music plays upon first user interaction due to browser autoplay policies
let initializedMusic = false;
document.body.addEventListener('click', () => {
    if (!initializedMusic && bgMusic && bgMusic.paused) {
        bgMusic.volume = 0.3; // Lower volume to 30%
        bgMusic.play().catch(e => console.log("Audio play prevented:", e));
        initializedMusic = true;
    }
    jump();
}, { once: false });

if (startBtn) startBtn.addEventListener('click', startGame);
if (failRestartBtn) failRestartBtn.addEventListener('click', resetGame);
if (restartBtn) restartBtn.addEventListener('click', resetGame);
if (pauseBtn) pauseBtn.addEventListener('click', togglePause);
if (resumeBtn) resumeBtn.addEventListener('click', togglePause);

if (openLetterBtn) {
    openLetterBtn.addEventListener('click', () => {
        if(winScreen) winScreen.classList.remove('active');
        if(letterScreen) letterScreen.classList.add('active');
        gameState = STATE_LETTER_READ;
    });
}

function jump() {
    if (gameState === STATE_PLAYING) {
        velocity = jumpStrength;
    } else if (gameState === STATE_START || gameState === STATE_FAIL) {
        // Optionally space/click could start/restart the game
        if (gameState === STATE_START && startBtn) startBtn.click();
        if (gameState === STATE_FAIL && failRestartBtn) failRestartBtn.click();
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (gameState === STATE_PLAYING || gameState === STATE_PAUSED) togglePause();
    }
    if (e.code === 'Space') {
        e.preventDefault(); 
        jump();
    }
});

function togglePause() {
    if (gameState === STATE_PLAYING) {
        gameState = STATE_PAUSED;
        pauseScreen.classList.add('active');
        pauseBtn.innerText = '▶';
        if (bgMusic) bgMusic.pause();
    } else if (gameState === STATE_PAUSED) {
        gameState = STATE_PLAYING;
        pauseScreen.classList.remove('active');
        pauseBtn.innerText = '❚❚';
        if (bgMusic) bgMusic.play().catch(e => console.log("Audio play prevented:", e));
    }
}

function startGame() {
    initAudio();
    if(startScreen) startScreen.classList.remove('active');
    if(hud) hud.classList.add('active');
    if(pauseBtn) pauseBtn.classList.remove('hidden');
    gameContainer.className = '';
    if (bgMusic) {
        bgMusic.volume = 0.3;
        bgMusic.currentTime = 0;
        bgMusic.play().catch(e => console.log("Audio play prevented:", e));
    }
    resetGameData();
    gameState = STATE_PLAYING;
}

function resetGame() {
    initAudio();
    if(failScreen) failScreen.classList.remove('active');
    if(winScreen) winScreen.classList.remove('active');
    if(letterScreen) letterScreen.classList.remove('active');
    if(hud) hud.classList.add('active');
    if(pauseBtn) pauseBtn.classList.remove('hidden');
    canvasWrapper.style.transform = "scale(1) translate(0px, 0px)"; 

    gameContainer.className = '';
    if (bgMusic) {
        bgMusic.volume = 0.3;
        bgMusic.currentTime = 0;
        bgMusic.play().catch(e => console.log("Audio play prevented:", e));
    }
    resetGameData();
    gameState = STATE_PLAYING;
}

function resetGameData() {
    bird.x = cw/4;  bird.y = ch/2;
    bird.flapFrame = 0; bird.hasLetter = true;
    mouseX = cw/4; mouseY = ch/2;
    
    pipes = []; flyingHearts = []; confetti = []; fireworks = [];
    score = 0; frameCount = 0;
    pipesSpawnedCount = 0;
    
    castle.active = false; castle.stopped = false;
    castle.x = cw + 200;
    
    girl.state = 'sad'; girl.hasLetter = false;
    letterItem.active = false; letterItem.giveSoundPlayed = false; letterItem.progress = 0;
    
    boy.active = false; boy.y = -150;
    
    velocity = 0;

    if(scoreVal) scoreVal.innerText = score;
}

function takeDamage() {
    gameState = STATE_FAIL;
    playFailSound();
    if(pauseBtn) pauseBtn.classList.add('hidden');
    if(flashOverlay) {
        flashOverlay.classList.add('flash-active');
        setTimeout(() => { flashOverlay.classList.remove('flash-active'); }, 150);
    }
    if(hud) hud.classList.remove('active');
    if(failScreen) setTimeout(() => { failScreen.classList.add('active'); }, 500);
}

function triggerLightning() {
    playThunder();
    if(lightningOverlay) {
        lightningOverlay.classList.remove('lightning-flash');
        void lightningOverlay.offsetWidth; 
        lightningOverlay.classList.add('lightning-flash');
    }
}

function spawnPipe() {
    if (pipesSpawnedCount >= targetScore) return; 

    let minPipeH = 100;
    let maxPipeH = ch - 100 - pipeGap - minPipeH;
    let topH = Math.floor(Math.random() * maxPipeH) + minPipeH;
    pipes.push({ x: cw, topH: topH, bottomY: topH + pipeGap, passed: false });
    
    pipesSpawnedCount++;
}

function createFirework(x, y) {
    playFirework();
    for (let i = 0; i < 50; i++) {
        let angle = Math.random() * Math.PI * 2;
        let speed = Math.random() * 5 + 3;
        fireworks.push({ x: x, y: y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, color: `hsl(${Math.random() * 360}, 100%, 60%)`, life: 1.0, decay: Math.random() * 0.015 + 0.01 });
    }
}

// Update Loop
function update() {
    if (gameState === STATE_PAUSED || gameState === STATE_LETTER_READ) {
        // Just let clouds and confetti float calmly in background behind letters
        if (gameState === STATE_LETTER_READ) {
            bird.y += Math.sin(frameCount * 0.1) * 0.5;
            frameCount++;
            for (let c of confetti) {
                c.y += c.v; c.x += c.drift; c.rotation += c.rotSpeed;
                if (c.y > ch) c.y = -20;
            }
        }
        return;
    }
    
    frameCount++;

    for(let c of clouds) {
        c.x -= c.v;
        if (c.x + 200 < 0) { c.x = cw + 100; c.y = Math.random() * (ch/4); } 
    }

    if (gameContainer.classList.contains('doom')) {
        for(let r of raindrops) {
            r.y += r.v;
            r.x -= pipeSpeed * 0.5; 
            if (r.y > ch) { r.y = -20; r.x = Math.random() * cw + 100; }
        }
    }

    if (gameState === STATE_START || gameState === STATE_FAIL) {
        bird.y += Math.sin(frameCount * 0.05) * 0.5;
        bird.flapFrame = (frameCount % 20 < 10) ? 0 : 1;
        bgOffset -= pipeSpeed * 0.5;
        if (bgOffset <= -100) bgOffset = 0;
        return;
    }

    bgOffset -= pipeSpeed * 0.5;
    if (bgOffset <= -100) bgOffset = 0;

    // Apply gravity
    velocity += gravity;
    bird.y += velocity;

    let flapSpeed = 15;
    if (velocity < 0) flapSpeed = 5; // Flap faster when going up
    bird.flapFrame = (frameCount % flapSpeed < flapSpeed/2) ? 0 : 1;

    // Movement checks
    if (gameState === STATE_PLAYING) {
        bird.x = cw / 4; 

        if (frameCount % 100 === 0) spawnPipe();
        if (Math.random() < 0.01 && !gameContainer.classList.contains('doom')) spawnHeart();

        if (score > 6 && gameContainer.classList.contains('doom') && Math.random() < 0.005) {
            triggerLightning();
        }

        for(let i = flyingHearts.length-1; i>=0; i--) {
            let fh = flyingHearts[i];
            fh.x -= fh.v + pipeSpeed; fh.wobble += 0.05; fh.y += Math.sin(fh.wobble) * 2;
            if (fh.x < -50) flyingHearts.splice(i, 1);
        }

        for (let i = pipes.length - 1; i >= 0; i--) {
            let p = pipes[i]; p.x -= pipeSpeed;
            let pad = 5;
            if (bird.x + pad < p.x + pipeWidth && bird.x + bird.w - pad > p.x && bird.y + pad < p.topH) { takeDamage(); break; }
            if (bird.x + pad < p.x + pipeWidth && bird.x + bird.w - pad > p.x && bird.y + bird.h - pad > p.bottomY) { takeDamage(); break; }

            if (!p.passed && bird.x > p.x + pipeWidth) {
                p.passed = true;
                score++;
                if(scoreVal) scoreVal.innerText = score;
                
                if (score === 6) {
                    gameContainer.className = 'doom'; 
                    triggerLightning();
                }

                if (score > 0 && score % 5 === 0 && score < targetScore) {
                    boy.active = true; boy.x = cw / 2; boy.y = -150; boy.progress = 0; motivationTimer = 0;
                    boy.messageIndex = Math.floor((score / 5) - 1) % motivationalMessages.length;
                }

                if (score >= targetScore) {
                    gameState = STATE_CASTLE;
                    castle.active = true;
                    if(pauseBtn) pauseBtn.classList.add('hidden');
                }
            }
            if (p.x + pipeWidth < 0) { pipes.splice(i, 1); }
        }
        if (bird.y + bird.h >= ch - 100) takeDamage();

        if (boy.active) {
            boy.progress++;
            if (boy.progress < 50) {
                boy.y += (boy.targetY - boy.y) * 0.1; // slide in
            } else {
                motivationTimer++;
                // 300 frames ~ 5 seconds at 60 FPS
                if (motivationTimer > 300) {
                    boy.y -= 5; 
                    if (boy.y < -150) boy.active = false;
                }
            }
        }

    } else if (gameState === STATE_CASTLE) {
        
        // exact zoom perspective locking 
        let cutsceneTargetY = ch / 2; 
        bird.y += (cutsceneTargetY - bird.y) * 0.05;
        // Turn off gravity during cutscene
        velocity = 0;

        for (let i=pipes.length-1; i>=0; i--) { pipes[i].x -= pipeSpeed; if (pipes[i].x + pipeWidth < 0) pipes.splice(i, 1); }
        if (boy.active) { boy.y -= 10; if (boy.y < -150) boy.active = false; }

        let destinationX = Math.max(cw - 300 - castle.w, 400); 
        if (castle.x > destinationX) {
            castle.x -= pipeSpeed; 
            
            let winXOffset = (castle.x + castle.w / 2); // Center focus
            let winYOffset = (ch / 2); 
            let tx = (cw/2) - winXOffset;
            let ty = (ch/2) - winYOffset;
            canvasWrapper.style.transform = `scale(1.8) translate(${tx/2}px, ${ty/2}px)`;

        } else {
            castle.stopped = true;
        }

        // Girl placed in the center of the castle
        girl.x = castle.x + castle.w / 2; 
        girl.y = (ch/2) + 10; 

        if (castle.stopped) {
            bird.x += (girl.x - 130 - bird.x) * 0.05;
        }

        if (castle.stopped && Math.abs(bird.x - (girl.x - 130)) < 30) {
            playBirdArrive(); 
            gameState = STATE_ANIMATION;
            if(hud) hud.classList.remove('active');
            
            letterItem.active = true;
            letterItem.x = bird.x + bird.w;
            letterItem.y = bird.y + bird.h/2;
            letterItem.targetX = girl.x - 20;
            letterItem.targetY = girl.y;
            letterItem.giveSoundPlayed = false;
            bird.hasLetter = false;
        }

    } else if (gameState === STATE_ANIMATION) {
        
        velocity = 0; // ensure no gravity applies
        bird.x -= (bird.x - (girl.x - 200)) * 0.05; // gracefully glide forward/hover
        // small smooth hover, not a drop
        bird.y += Math.sin(frameCount * 0.05) * 0.3; 
        
        if (letterItem.progress < 1) {
            letterItem.progress += 0.015;
            letterItem.x = letterItem.x + (letterItem.targetX - letterItem.x) * 0.1;
            letterItem.y = letterItem.y + (letterItem.targetY - letterItem.y) * 0.1;

            if (letterItem.progress >= 0.8 && girl.state === 'sad') {
                if (!letterItem.giveSoundPlayed) {
                    playLetterGive();
                    letterItem.giveSoundPlayed = true;
                }
                girl.state = 'reading';
                letterItem.active = false;
                girl.hasLetter = true;
            }

            if (letterItem.progress >= 1) {
                setTimeout(() => {
                    if (gameState === STATE_ANIMATION) {
                        girl.state = 'smiling';
                        playApplause();
                        createConfetti(); 
                        
                        gameContainer.className = 'sunny-blast';
                        
                        let fwCount = 0;
                        let fwInterval = setInterval(() => {
                            createFirework(castle.x + castle.w - Math.random()*200, girl.y - 100 - Math.random()*200);
                            fwCount++;
                            if (fwCount > 10) clearInterval(fwInterval);
                        }, 400);

                        gameState = STATE_WIN;
                        setTimeout(() => { winScreen.classList.add('active'); }, 3000); 
                    }
                }, 1500); 
            }
        }
    } else if (gameState === STATE_WIN) {
        bird.y += Math.sin(frameCount * 0.1) * 0.5;
        for (let i = fireworks.length - 1; i >= 0; i--) {
            let fw = fireworks[i]; fw.x += fw.vx; fw.y += fw.vy; fw.vy += 0.08; fw.life -= fw.decay;
            if (fw.life <= 0) fireworks.splice(i, 1);
        }
        for (let c of confetti) {
            c.y += c.v;
            c.x += c.drift;
            c.rotation += c.rotSpeed;
            if (c.y > ch) c.y = -20;
        }
    }
}

// --- DRAWING LOGIC ---

function drawClouds() {
    let clColor = gameContainer.classList.contains('doom') ? 'rgba(100, 110, 120, 0.8)' : 'rgba(255, 255, 255, 0.7)';
    ctx.fillStyle = clColor;
    for(let c of clouds) {
        ctx.save();
        ctx.translate(c.x, c.y); ctx.scale(c.s, c.s);
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.arc(25, -15, 35, 0, Math.PI * 2);
        ctx.arc(55, 0, 30, 0, Math.PI * 2); ctx.arc(25, 10, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function drawRain() {
    rainCtx.clearRect(0, 0, cw, ch);
    if (!gameContainer.classList.contains('doom')) return;
    rainCtx.strokeStyle = 'rgba(150, 200, 255, 0.4)';
    rainCtx.lineWidth = 1.5;
    rainCtx.beginPath();
    for(let r of raindrops) {
        rainCtx.moveTo(r.x, r.y);
        rainCtx.lineTo(r.x - 3, r.y + r.l); 
    }
    rainCtx.stroke();
}

function drawScenery() {
    // Determine lighting based on the container class
    let groundColor = gameContainer.classList.contains('doom') ? '#4b6584' : '#2ecc71';
    let grassColor = gameContainer.classList.contains('doom') ? '#3867d6' : '#27ae60';
    let darkGrass = gameContainer.classList.contains('doom') ? '#2d3436' : '#1e8449';

    // MOUNTAINS (Parallax background)
    let mountainOffset = bgOffset * 0.3; // Slower scroll for parallax effect
    for(let m of mountains) {
        let drawX = m.x + mountainOffset;
        if (drawX + m.w < 0) {
            drawX += mountains.length * (m.w * 0.6);
            m.x = drawX - mountainOffset;
        }

        ctx.fillStyle = gameContainer.classList.contains('doom') ? '#2d3436' : m.colorBase;
        ctx.beginPath();
        ctx.moveTo(drawX, m.y);
        ctx.lineTo(drawX + m.w/2, m.y - m.h);
        ctx.lineTo(drawX + m.w, m.y);
        ctx.fill();
        
        // Mountain peak snow
        if (!gameContainer.classList.contains('doom')) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.moveTo(drawX + m.w/2, m.y - m.h);
            ctx.lineTo(drawX + m.w/2 - m.w*0.15, m.y - m.h + m.h*0.3);
            ctx.lineTo(drawX + m.w/2 - m.w*0.05, m.y - m.h + m.h*0.25);
            ctx.lineTo(drawX + m.w/2 + m.w*0.1, m.y - m.h + m.h*0.35);
            ctx.lineTo(drawX + m.w/2 + m.w*0.2, m.y - m.h + m.h*0.25);
            ctx.fill();
        }
    }

    // MAIN GROUND LAYER
    ctx.fillStyle = gameContainer.classList.contains('doom') ? '#2d3436' : '#8B4513';
    ctx.fillRect(0, ch - 100, cw, 100);

    // GRASS TOP LAYER (Realistic texture)
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, ch - 100, cw, 25);

    // GRASS BLADES
    ctx.fillStyle = grassColor;
    let grassStride = 15;
    for (let i = 0; i <= cw + 50; i += grassStride) {
        let offsetX = i + (bgOffset % grassStride);
        let tuftHeight = Math.random() * 10 + 10;
        ctx.beginPath();
        ctx.moveTo(offsetX, ch - 100 + 5);
        ctx.lineTo(offsetX + 4, ch - 100 - tuftHeight);
        ctx.lineTo(offsetX + 8, ch - 100 + 5);
        ctx.fill();
    }
    
    // SECONDARY DARKER GRASS
    ctx.fillStyle = darkGrass;
    for (let i = 5; i <= cw + 50; i += grassStride * 1.5) {
        let offsetX = i + (bgOffset % (grassStride * 1.5));
        let tuftHeight = Math.random() * 8 + 6;
        ctx.beginPath();
        ctx.moveTo(offsetX, ch - 100 + 10);
        ctx.lineTo(offsetX + 3, ch - 100 - tuftHeight);
        ctx.lineTo(offsetX + 6, ch - 100 + 10);
        ctx.fill();
    }
}

function drawHearts() {
    if (gameContainer.classList.contains('doom')) return; 
    ctx.fillStyle = '#FF7675';
    for(let fh of flyingHearts) {
        ctx.save();
        ctx.translate(fh.x, fh.y); ctx.scale(fh.s, fh.s);
        ctx.beginPath(); ctx.moveTo(0, 5); ctx.bezierCurveTo(0, -5, -10, -5, -10, 5); ctx.bezierCurveTo(-10, 15, 0, 20, 0, 25); ctx.bezierCurveTo(0, 20, 10, 15, 10, 5); ctx.bezierCurveTo(10, -5, 0, -5, 0, 5); ctx.fill();
        ctx.restore();
    }
}

function drawConfetti() {
    for (let c of confetti) {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation * Math.PI / 180);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.w/2, -c.h/2, c.w, c.h);
        ctx.restore();
    }
}

function drawBoyfriendMessage(x, y, text) {
    ctx.save();
    ctx.translate(x, y);

    ctx.font = "12px 'Press Start 2P', monospace";
    let textWidth = ctx.measureText(text).width;
    let bubW = textWidth + 30;
    
    let bubLeftX = -(bubW/2);
    
    // --- DRAW HEAD ---
    let headX = bubLeftX - 50; 
    let headY = -15; 
    
    ctx.fillStyle = '#FFDCB6';
    ctx.fillRect(headX + 15, headY + 30, 10, 10);
    ctx.fillRect(headX, headY, 40, 35);
    
    ctx.fillStyle = '#5c4033'; 
    ctx.fillRect(headX - 5, headY - 10, 50, 20); 
    ctx.fillRect(headX - 10, headY, 15, 30); 
    ctx.fillRect(headX + 35, headY, 15, 30); 

    ctx.fillStyle = '#e84118';
    ctx.fillRect(headX - 5, headY - 5, 6, 12);
    ctx.fillRect(headX + 12, headY - 10, 8, 8);
    ctx.fillRect(headX + 40, headY - 5, 4, 15);
    
    ctx.fillStyle = '#5c4033'; 
    for(let c=0; c<6; c++) { ctx.fillRect(headX - 5 + (c*8), headY - 15, 8, 8); }
    ctx.fillRect(headX - 12, headY + 5, 6, 8);
    ctx.fillRect(headX + 46, headY + 5, 6, 8);
    ctx.fillRect(headX - 12, headY + 18, 6, 8);
    ctx.fillRect(headX + 46, headY + 18, 6, 8);
    
    ctx.fillStyle = '#ffffff'; 
    ctx.fillRect(headX + 8, headY + 15, 6, 6); 
    ctx.fillRect(headX + 26, headY + 15, 6, 6); 
    ctx.fillStyle = '#8B4513'; 
    ctx.fillRect(headX + 10, headY + 17, 3, 3); 
    ctx.fillRect(headX + 28, headY + 17, 3, 3); 
    
    ctx.fillStyle = '#000';
    ctx.fillRect(headX + 16, headY + 28, 8, 2);

    // --- DRAW SPEECH BUBBLE ---
    let bubTopY = 0;
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.moveTo(bubLeftX, bubTopY + 15);      
    ctx.lineTo(bubLeftX, bubTopY + 25);      
    ctx.lineTo(bubLeftX - 15, bubTopY + 20); 
    ctx.fill();
    
    ctx.fillRect(bubLeftX, bubTopY, bubW, 40);
    ctx.strokeStyle = '#e84118'; 
    ctx.lineWidth = 2;
    ctx.strokeRect(bubLeftX, bubTopY, bubW, 40);
    
    ctx.fillStyle = '#fff';
    ctx.fillText(text, bubLeftX + 15, bubTopY + 25);
    
    ctx.restore();
}

function drawPixelArtBird(x, y, w, h, flap, hasLetter) { 
    ctx.save();
    ctx.translate(x, y); ctx.scale(1.2, 1.2);
    ctx.fillStyle = '#e67e22'; ctx.fillRect(-10, 15, 15, 3); ctx.fillRect(-5, 18, 15, 3); 
    ctx.fillStyle = '#fff'; ctx.fillRect(5, 5, 25, 12); ctx.fillRect(25, -5, 6, 15); ctx.fillRect(28, -12, 12, 8); 
    ctx.fillStyle = '#e67e22'; ctx.fillRect(40, -9, 16, 3); 
    ctx.fillStyle = '#000'; ctx.fillRect(34, -10, 2, 2); 
    ctx.fillStyle = '#2d3436'; ctx.fillRect(-2, 5, 8, 8); 

    if (flap === 0) { ctx.fillStyle = '#fff'; ctx.fillRect(10, -8, 14, 13); ctx.fillStyle = '#2d3436'; ctx.fillRect(5, -12, 10, 6); } 
    else { ctx.fillStyle = '#fff'; ctx.fillRect(10, 15, 14, 13); ctx.fillStyle = '#2d3436'; ctx.fillRect(5, 23, 10, 6); }
    
    if (hasLetter) { drawLetter(45, -6); }
    ctx.restore();
}

function drawLetter(x, y) {
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 16, 12); ctx.strokeStyle = '#b2bec3'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(8,6); ctx.lineTo(16,0); ctx.stroke(); ctx.fillStyle = '#d63031'; ctx.fillRect(7, 4, 3, 3); ctx.restore();
}

function drawGirlBody(x, y, state, hasLetter) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(1.5, 1.5);
    ctx.fillStyle = '#6c5ce7'; ctx.fillRect(15, 40, 30, 50);
    
    ctx.fillStyle = '#FFDCB6';
    if (state === 'sad') { 
        ctx.fillRect(10, 45, 15, 6); ctx.fillRect(35, 45, 15, 6); 
    } 
    else { ctx.fillRect(10, 45, 15, 6); ctx.fillRect(35, 45, 15, 6); if (hasLetter) { drawLetter(22, 40); } }
    
    ctx.fillStyle = '#FFDCB6'; ctx.fillRect(15, 10, 30, 30);
    ctx.fillStyle = '#ffeaa7'; ctx.fillRect(10, 5, 40, 15); ctx.fillRect(10, 15, 8, 40); ctx.fillRect(42, 15, 8, 40);
    if (state === 'sad') { ctx.fillRect(12, 10, 10, 15); }
    
    ctx.fillStyle = '#2d3436'; ctx.fillRect(17, 20, 10, 10); ctx.fillRect(33, 20, 10, 10);
    ctx.fillStyle = '#FFDCB6'; ctx.fillRect(19, 22, 6, 6); ctx.fillRect(35, 22, 6, 6);
    ctx.fillStyle = '#2d3436'; ctx.fillRect(27, 24, 6, 2);
    
    if (state === 'sad') {
        ctx.fillStyle = '#3498db'; ctx.fillRect(21, 25, 4, 2); ctx.fillRect(37, 25, 4, 2);
        ctx.fillStyle = '#74b9ff'; ctx.fillRect(21, 28, 2, 4);
    } else if (state === 'reading') {
        ctx.fillStyle = '#2980b9'; ctx.fillRect(20, 23, 4, 4); ctx.fillRect(36, 23, 4, 4);
    } else if (state === 'smiling') {
        ctx.strokeStyle = '#3498db'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(19, 25); ctx.quadraticCurveTo(22, 22, 25, 25); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(35, 25); ctx.quadraticCurveTo(38, 22, 41, 25); ctx.stroke();
        ctx.fillStyle = '#ff7675'; ctx.fillRect(16, 28, 4, 3); ctx.fillRect(40, 28, 4, 3);
    }

    ctx.fillStyle = '#000';
    if (state === 'sad') { ctx.fillRect(25, 34, 10, 2); ctx.fillRect(24, 36, 2, 2); ctx.fillRect(34, 36, 2, 2); } 
    else if (state === 'reading') { ctx.fillRect(28, 33, 4, 4); } 
    else if (state === 'smiling') {
        ctx.fillRect(25, 32, 10, 2); ctx.fillRect(24, 30, 2, 2); ctx.fillRect(34, 30, 2, 2); ctx.fillRect(26, 34, 8, 4);
        ctx.fillStyle = '#ff7675'; ctx.fillRect(27, 36, 6, 2);
    }
    ctx.restore();
}

function drawCastle(c) {
    ctx.save();
    ctx.translate(c.x, c.y);

    ctx.fillStyle = '#2d3436';
    ctx.fillRect(c.w - 50, 50, 50, c.h); 

    ctx.fillStyle = '#b2bec3';
    ctx.fillRect(0, 50, c.w - 50, c.h); 
    
    ctx.fillStyle = '#636e72';
    for(let bx = 20; bx < c.w - 100; bx += 60) {
        for(let by = 80; by < c.h; by += 40) {
            ctx.fillRect(bx, by, 40, 15);
            if (by % 80 === 0) bx += 30;
            if (bx > c.w - 100) bx -= 30; 
        }
    }

    for (let i=0; i < Math.floor((c.w-50) / 70); i++) {
        ctx.fillStyle = '#b2bec3';
        ctx.fillRect(10 + (i * 70), 10, 50, 40);
        ctx.fillStyle = '#636e72';
        ctx.fillRect(60 + (i * 70), 30, 20, 20); 
    }

    let winX = c.w - 280;
    let winY = (ch/2) - 80;
    
    ctx.fillStyle = '#dfe6e9'; 
    ctx.fillRect(winX - 10, winY - 10, 180, 220);

    ctx.fillStyle = '#636e72'; 
    ctx.fillRect(winX - 5, winY - 5, 170, 210);

    ctx.fillStyle = '#1e272e'; 
    ctx.fillRect(winX, winY, 160, 200);

    ctx.fillStyle = '#2d3436'; 
    ctx.fillRect(winX, winY, 20, 200);
    
    ctx.fillStyle = '#fff';
    ctx.fillRect(winX - 25, winY + 200, 210, 20); 
    
    ctx.fillStyle = '#b2bec3';
    ctx.fillRect(winX - 25, winY + 220, 210, 15); 

    ctx.restore();
}

function drawPipes() {
    for (let p of pipes) {
        ctx.fillStyle = '#00b894'; ctx.fillRect(p.x, 0, pipeWidth, p.topH); ctx.fillRect(p.x, p.bottomY, pipeWidth, ch - p.bottomY - 100);
        ctx.fillStyle = '#008e76'; ctx.fillRect(p.x + pipeWidth - 10, 0, 10, p.topH); ctx.fillRect(p.x + pipeWidth - 10, p.bottomY, 10, ch - p.bottomY - 100);
        ctx.fillStyle = '#00b894'; let capH = 35;
        ctx.fillRect(p.x - 6, p.topH - capH, pipeWidth + 12, capH); ctx.fillRect(p.x - 6, p.bottomY, pipeWidth + 12, capH);
        ctx.fillStyle = '#008e76'; ctx.fillRect(p.x - 6 + pipeWidth + 2, p.topH - capH, 10, capH); ctx.fillRect(p.x - 6 + pipeWidth + 2, p.bottomY, 10, capH);
        ctx.fillStyle = '#55efc4'; ctx.fillRect(p.x + 8, 0, 8, p.topH - capH); ctx.fillRect(p.x + 8, p.bottomY + capH, 8, ch - p.bottomY - 100 - capH);
        ctx.fillRect(p.x, p.topH - capH, 8, capH); ctx.fillRect(p.x, p.bottomY, 8, capH);
    }
}

function draw() {
    ctx.clearRect(0, 0, cw, ch);
    
    drawClouds();

    let groundY = ch - 100;
    let dirtC = gameContainer.classList.contains('doom') ? '#6c5625' : '#e1b12c';
    let gC1 = gameContainer.classList.contains('doom') ? '#7b9142' : '#badc58';
    let gC2 = gameContainer.classList.contains('doom') ? '#497336' : '#6ab04c';

    ctx.fillStyle = dirtC; ctx.fillRect(0, groundY, cw, 100);
    ctx.fillStyle = gC1; ctx.fillRect(0, groundY, cw, 25);
    ctx.fillStyle = gC2; ctx.fillRect(0, groundY+25, cw, 10);
    
    for (let i = 0; i < cw / 80 + 2; i++) {
        ctx.beginPath(); let lx = i * 80 + bgOffset;
        ctx.moveTo(lx, groundY); ctx.lineTo(lx + 20, groundY); ctx.lineTo(lx - 10, groundY+25); ctx.lineTo(lx - 30, groundY+25); ctx.fill();
    }

    if (gameState === STATE_START) {
        drawPixelArtBird(cw/2, ch/2 - 80, bird.w, bird.h, bird.flapFrame, true);
        return;
    }

    drawHearts();

    if (boy.active) { drawBoyfriendMessage(boy.x, boy.y, motivationalMessages[boy.messageIndex]); }

    if (castle.active) {
        drawCastle(castle);
        drawGirlBody(girl.x, girl.y, girl.state, girl.hasLetter);
    }

    drawPipes();
    if (letterItem.active) { drawLetter(letterItem.x, letterItem.y); }
    
    drawPixelArtBird(bird.x, bird.y, bird.w, bird.h, bird.flapFrame, bird.hasLetter);

    for (let fw of fireworks) {
        ctx.fillStyle = fw.color; ctx.globalAlpha = fw.life;
        ctx.beginPath(); ctx.arc(fw.x, fw.y, 4, 0, Math.PI*2); ctx.fill();
    }
    
    if (gameState === STATE_WIN || gameState === STATE_LETTER_READ) {
        drawConfetti();
    }
    
    ctx.globalAlpha = 1.0;
}

function loop() {
    update();
    draw();
    drawRain();
    requestAnimationFrame(loop);
}

loop();