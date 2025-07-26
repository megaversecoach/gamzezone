/*
 * Renkli Tetris oyununun ana JavaScript dosyasi.
 * Bu dosya oyun mantigini, cizimleri, animasyonlari ve kullanici etkilesimlerini yonetir.
 * 7 yasindaki bir cocuk icin tasarlanmis olup renkli bloklar, seviyeler arasi konfeti efekti,
 * motivasyon saglayan sesli bildirimler ve arka plan muzik listesi icerir.
 */

// === Oyun degiskenleri ===
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Konfeti animasyonu icin ikinci canvas
const confettiCanvas = document.getElementById('confettiCanvas');
const confettiCtx = confettiCanvas.getContext('2d');

// Skor ve seviye degiskenleri
let linesCleared = 0;
let level = 1;
let score = 0;

// Oyun tahtasi boyutu (sutun x satir)
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30; // her hucre 30 piksel

// Oyun tahtasi, her hucre 0 (bos) veya renk degeri tasir
let board = createEmptyBoard();

// Aktif tetromino
let currentPiece = null;
let currentX = 0;
let currentY = 0;

// Oyun dongusu kontrolu
let fallInterval = null;
let fallSpeed = 500; // ms cinsinden baslangic hizi, slider ile ayarlanabilir

// Ses/Muzik calar
const audioPlayer = document.getElementById('audioPlayer');
let playlist = [];
let currentTrackIndex = 0;

// Konfeti parcaciklari
let confettiParticles = [];
let confettiActive = false;

// Tetromino sekilleri (her sekil 4x4 matris seklinde tanimlanir)
const TETROMINOS = {
    I: {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: '#66C7F4' // acik mavi
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#7E57C2' // mor
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#FFA726' // turuncu
    },
    O: {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#FFD54F' // sari
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: '#4DB6AC' // yesil
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#BA68C8' // lila
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: '#E57373' // kirmizi
    }
};

// DOM ogeleri
const linesSpan = document.getElementById('lines');
const levelSpan = document.getElementById('level');
const scoreSpan = document.getElementById('score');

const speedRange = document.getElementById('speedRange');
const speedValue = document.getElementById('speedValue');
const difficultySelect = document.getElementById('difficultySelect');

const musicSelect = document.getElementById('musicSelect');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const nextBtn = document.getElementById('nextBtn');
const fileInput = document.getElementById('fileInput');

const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const downBtn = document.getElementById('downBtn');
const rotateBtn = document.getElementById('rotateBtn');

// === Baslatma ===
window.addEventListener('load', () => {
    // Tahtanin olculerine uygun canvas ayari
    canvas.width = COLS * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;

    // Default sarkiyi ekle ve secenegi doldur
    setupMusic();

    // Oyun kontrol olaylari
    document.addEventListener('keydown', handleKeyDown);
    leftBtn.addEventListener('click', () => movePiece(-1, 0));
    rightBtn.addEventListener('click', () => movePiece(1, 0));
    downBtn.addEventListener('click', () => dropPiece());
    rotateBtn.addEventListener('click', () => rotatePiece());

    // Hiz degisimi
    speedRange.addEventListener('input', () => {
        fallSpeed = parseInt(speedRange.value);
        speedValue.textContent = `${fallSpeed} ms`;
        restartInterval();
    });

    // Zorluk degisimi
    difficultySelect.addEventListener('change', () => {
        const diff = difficultySelect.value;
        switch (diff) {
            case 'easy':
                fallSpeed = 700;
                break;
            case 'normal':
                fallSpeed = 500;
                break;
            case 'hard':
                fallSpeed = 300;
                break;
        }
        speedRange.value = fallSpeed;
        speedValue.textContent = `${fallSpeed} ms`;
        restartInterval();
    });

    // Muzik kontrolleri
    playBtn.addEventListener('click', () => playMusic());
    pauseBtn.addEventListener('click', () => pauseMusic());
    nextBtn.addEventListener('click', () => nextTrack());
    fileInput.addEventListener('change', handleFileUpload);
    musicSelect.addEventListener('change', () => {
        currentTrackIndex = parseInt(musicSelect.value);
        playMusic();
    });

    // Baslangicta yeni tetromino olustur ve oyun dongusunu baslat
    spawnNewPiece();
    fallInterval = setInterval(gameLoop, fallSpeed);
});

// === Oyun fonksiyonlari ===

// Bos bir oyun tahtasi olusturur
function createEmptyBoard() {
    const matrix = [];
    for (let r = 0; r < ROWS; r++) {
        const row = new Array(COLS).fill(0);
        matrix.push(row);
    }
    return matrix;
}

// Yeni rastgele bir tetromino uretir
function spawnNewPiece() {
    const types = Object.keys(TETROMINOS);
    const randType = types[Math.floor(Math.random() * types.length)];
    currentPiece = JSON.parse(JSON.stringify(TETROMINOS[randType]));

    // Baslangic konumu yukarida ortalanir
    currentY = 0;
    currentX = Math.floor((COLS - currentPiece.shape[0].length) / 2);
    // Eger cakisma olursa oyun biter ve sifirlanir
    if (collides(currentPiece.shape, currentX, currentY)) {
        endGame();
    }
}

// Oyun dongusunde her adim tetromino bir satir iner
function gameLoop() {
    if (!movePiece(0, 1)) {
        // Yere temas ettiginde tahtaya kaydet
        fixPiece();
        clearLines();
        spawnNewPiece();
    }
    draw();
}

// Tahtayi ve mevcut tetrominoyu cizer
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Mevcut bloklari ciz
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c]) {
                drawBlock(c, r, board[r][c]);
            }
        }
    }
    // Aktif tetrominoyu ciz
    if (currentPiece) {
        const shape = currentPiece.shape;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    drawBlock(currentX + c, currentY + r, currentPiece.color);
                }
            }
        }
    }
}

// Belirli koordinata renkli bir kare cizer
function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// Tetrominoyu belirtilen yonde hareket ettirir
function movePiece(dx, dy) {
    const newX = currentX + dx;
    const newY = currentY + dy;
    if (!collides(currentPiece.shape, newX, newY)) {
        currentX = newX;
        currentY = newY;
        return true;
    }
    return false;
}

// Tetrominoyu saat yonunde dondurur
function rotatePiece() {
    const shape = currentPiece.shape;
    // Transpoz ve ters cevirme ile dondurme
    const newShape = shape[0].map((_, i) => shape.map(row => row[i]).reverse());
    if (!collides(newShape, currentX, currentY)) {
        currentPiece.shape = newShape;
    }
    draw();
}

// Tetrominoyu asagiya dusurur (bir satir)
function dropPiece() {
    if (!movePiece(0, 1)) {
        fixPiece();
        clearLines();
        spawnNewPiece();
    }
    draw();
}

// Tahtaya tetrominoyu sabitler
function fixPiece() {
    const shape = currentPiece.shape;
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                const boardY = currentY + r;
                const boardX = currentX + c;
                if (boardY >= 0) {
                    board[boardY][boardX] = currentPiece.color;
                }
            }
        }
    }
}

// Tamamlanan satirlari kontrol eder ve temizler, skor ve seviye gunceller
function clearLines() {
    let linesRemoved = 0;
    for (let r = board.length - 1; r >= 0; r--) {
        if (board[r].every(cell => cell !== 0)) {
            // satiri sil ve ustten yeni satir ekle
            board.splice(r, 1);
            board.unshift(new Array(COLS).fill(0));
            linesRemoved++;
            r++; // ayni satiri yeniden kontrol etmek icin
        }
    }
    if (linesRemoved > 0) {
        linesCleared += linesRemoved;
        score += linesRemoved * 100;
        // Her 10 satirda seviye artar
        const newLevel = Math.floor(linesCleared / 10) + 1;
        if (newLevel > level) {
            level = newLevel;
            // Seviye atlandiginda hizi artir (dusurulen ms)
            fallSpeed = Math.max(100, fallSpeed - 50);
            speedRange.value = fallSpeed;
            speedValue.textContent = `${fallSpeed} ms`;
            restartInterval();
            // Konfeti ve sesli mesaji tetikle
            launchConfetti();
            congratulatePlayer();
        }
        updateInfoPanel();
    }
}

// Cakisma kontrolu: sekil verilen konumda tahtayla veya sinirlarla cakisiyor mu
function collides(shape, x, y) {
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                const newX = x + c;
                const newY = y + r;
                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }
                if (newY >= 0 && board[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Skor, seviye ve satir bilgilerini panelde gunceller
function updateInfoPanel() {
    linesSpan.textContent = linesCleared;
    levelSpan.textContent = level;
    scoreSpan.textContent = score;
}

// Oyun bitince (yeni tetromino yerlestirilemiyorsa) sifirla
function endGame() {
    clearInterval(fallInterval);
    alert('Oyun bitti! Skorunuz: ' + score);
    // Tahtayi ve skorlari sifirla
    board = createEmptyBoard();
    linesCleared = 0;
    level = 1;
    score = 0;
    updateInfoPanel();
    fallSpeed = parseInt(speedRange.value);
    restartInterval();
}

// Zamanlayiciyi sifirlayarak mevcut hizla devam et
function restartInterval() {
    clearInterval(fallInterval);
    fallInterval = setInterval(gameLoop, fallSpeed);
}

// Klavye kontrol fonksiyonu
function handleKeyDown(event) {
    switch (event.key) {
        case 'ArrowLeft':
            movePiece(-1, 0);
            break;
        case 'ArrowRight':
            movePiece(1, 0);
            break;
        case 'ArrowDown':
            dropPiece();
            break;
        case 'ArrowUp':
        case ' ':
            rotatePiece();
            break;
    }
    draw();
}

// === Konfeti animasyonu ===

// Konfeti parcacigi olusturucusu
class ConfettiParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = Math.random() * 3 + 2;
        this.size = Math.random() * 6 + 4;
        this.color = color;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05; // yercekimi
    }
    draw() {
        confettiCtx.fillStyle = this.color;
        confettiCtx.fillRect(this.x, this.y, this.size, this.size);
    }
}

// Konfeti baslatir
function launchConfetti() {
    confettiActive = true;
    confettiCanvas.style.display = 'block';
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    confettiParticles = [];
    // Farkli renklerde 200 parcacik yarat
    const confettiColors = ['#ff7675', '#fdcb6e', '#74b9ff', '#55efc4', '#a29bfe'];
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * confettiCanvas.width;
        const y = -10; // ustten baslar
        const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        confettiParticles.push(new ConfettiParticle(x, y, color));
    }
    requestAnimationFrame(confettiAnimate);
    // Konfeti 4 saniye sonra durdurulur
    setTimeout(stopConfetti, 4000);
}

function confettiAnimate() {
    if (!confettiActive) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParticles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(confettiAnimate);
}

function stopConfetti() {
    confettiActive = false;
    confettiCanvas.style.display = 'none';
}

// Seviye atlayinca sesli mesaj (Text‑to‑Speech API ile)
function congratulatePlayer() {
    const msg = new SpeechSynthesisUtterance('Harika! Tebrik ederim, basardin!');
    msg.lang = 'tr-TR';
    speechSynthesis.speak(msg);
}

// === Muzik kontrol fonksiyonlari ===

// Varsayilan muzik listesi kurulum
function setupMusic() {
    // Varsayilan bir sarki eklemek yerine listeyi bos birakiyoruz.
    // Kullanici kendi muzik dosyalarini yukleyebilecegi icin onceden tanimli bir sarki eklemiyoruz.
    playlist.length = 0;
    populateMusicSelect();
}

// Muzik secim kutusunu doldurur
function populateMusicSelect() {
    musicSelect.innerHTML = '';
    playlist.forEach((track, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = track.name;
        musicSelect.appendChild(option);
    });
    musicSelect.value = currentTrackIndex;
}

// Aktif sarkiyi yukler
function loadCurrentTrack() {
    const track = playlist[currentTrackIndex];
    if (track) {
        audioPlayer.src = track.src;
        audioPlayer.load();
    }
}

function playMusic() {
    if (!audioPlayer.src) return;
    audioPlayer.play();
}

function pauseMusic() {
    audioPlayer.pause();
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    musicSelect.value = currentTrackIndex;
    loadCurrentTrack();
    playMusic();
}

// Kullanicinin sectigi ses dosyalarini listeye ekler
function handleFileUpload(event) {
    const files = event.target.files;
    for (const file of files) {
        const url = URL.createObjectURL(file);
        playlist.push({ name: file.name, src: url });
    }
    populateMusicSelect();
}

// Sarki bittiginde otomatik siradaki calinir
audioPlayer.addEventListener('ended', () => {
    nextTrack();
});
