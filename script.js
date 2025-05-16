// script.js

// HTML 요소 가져오기 (이전과 동일)
const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const finalScoreDisplay = document.getElementById('final-score');

// 게임 설정
let vida = 4;
let puntuación = 0;
let isGameOver = false;
const playerSpeed = 12; // 8 * 1.5 (속도는 선택적으로 조절, 약간 빠르게)
const playerWidth = 100;  // 50 * 2
const playerHeight = 60; // 30 * 2

// 플레이어 위치 (이전과 동일)
let playerX = player.offsetLeft;
let playerY = player.offsetTop;

// 플레이어 이동 상태 (이전과 동일)
const keysPressed = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false,
    ' ': false
};

// 레이저 관련 설정 (이전과 동일)
const lasers = [];
const laserSpeed = 15; // 10 * 1.5 (속도는 선택적으로 조절)
const laserCooldown = 300; // 그대로 두거나 약간 조절
let lastLaserTime = 0;
const laserWidth = 10;  // 5 * 2
const laserHeight = 30; // 15 * 2

// 적 비행기 관련 설정
const enemies = [];
const enemySpeed = 4.5; // 3 * 1.5 (속도는 선택적으로 조절)
const enemySpawnInterval = 1800; // 2000ms 에서 약간 줄여서 밀도 유지 (선택 사항)
let lastEnemySpawnTime = 0;
const enemyWidth = 60;  // 30 * 2
const enemyHeight = 60; // 30 * 2

// 스타 아이템 관련 설정
const stars = [];
const starSpeed = 4; // 2.5 * 1.5 (속도는 선택적으로 조절)
const starSpawnInterval = 13000; // 15000ms 에서 약간 줄여서 밀도 유지 (선택 사항)
let lastStarSpawnTime = 0;
const starWidth = 50;  // 25 * 2
const starHeight = 50; // 25 * 2
const maxVida = 6;
// --- 여기까지 신규 ---

// 게임 루프 ID (이전과 동일)
let gameLoopId;

// 1. 게임 시작 함수 (수정: 스타 아이템 초기화 추가)
function startGame() {
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    gameContainer.style.display = 'block';
    document.getElementById('game-info').style.display = 'block';

    vida = 4;
    puntuación = 0;
    isGameOver = false;
    livesDisplay.textContent = vida;
    scoreDisplay.textContent = puntuación;

    player.style.left = `calc(50% - ${playerWidth / 2}px)`; // CSS calc 사용시 자동, JS로 하면 playerX 초기화
    player.style.bottom = '20px'; // 바닥에서의 간격도 약간 늘림 (선택 사항)
    player.style.top = '';

    playerX = player.offsetLeft; // CSS left 값을 기준으로 가져오도록 변경
    playerY = gameContainer.offsetHeight - playerHeight - parseInt(player.style.bottom || '20px'); // bottom 값 사용
    player.style.top = playerY + 'px';


    lasers.forEach(laser => laser.element.remove());
    lasers.length = 0;

    enemies.forEach(enemy => enemy.element.remove());
    enemies.length = 0;
    lastEnemySpawnTime = 0;

    // --- 기존 스타 아이템 제거 (신규) ---
    stars.forEach(star => star.element.remove());
    stars.length = 0;
    lastStarSpawnTime = Date.now(); // 게임 시작 시 바로 스타가 나오지 않도록 현재 시간으로 초기화
    // --- 여기까지 신규 ---

    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
    }
    gameLoop();
}

// 2. 키보드 이벤트 리스너 (이전과 동일)
document.addEventListener('keydown', (event) => {
    if (keysPressed.hasOwnProperty(event.key)) {
        keysPressed[event.key] = true;
    }
});
document.addEventListener('keyup', (event) => {
    if (keysPressed.hasOwnProperty(event.key)) {
        keysPressed[event.key] = false;
    }
});

// 3. 레이저 생성 함수 (이전과 동일)
function createLaser() {
    const currentTime = Date.now();
    if (currentTime - lastLaserTime < laserCooldown) return;
    lastLaserTime = currentTime;
    const laserElement = document.createElement('div');
    laserElement.classList.add('laser');
    gameContainer.appendChild(laserElement);
    const laser = { element: laserElement, x: playerX + playerWidth / 2 - laserWidth / 2, y: playerY, width: laserWidth, height: laserHeight };
    lasers.push(laser);
    laser.element.style.left = laser.x + 'px';
    laser.element.style.top = laser.y + 'px';
}

// 4. 레이저 업데이트 함수 (이전과 동일)
function updateLasers() {
    for (let i = lasers.length - 1; i >= 0; i--) {
        const laser = lasers[i];
        laser.y -= laserSpeed;
        if (laser.y < -laser.height) {
            laser.element.remove();
            lasers.splice(i, 1);
        } else {
            laser.element.style.top = laser.y + 'px';
        }
    }
}

// script.js 의 createEnemy 함수 내부

// 5. 적 생성 함수 (수정: 텍스트 컨텐츠 추가)
function createEnemy() {
    const enemyElement = document.createElement('div');
    enemyElement.classList.add('enemy');
    enemyElement.textContent = '🛸'; // <<< UFO 이모티콘으로 변경!
    gameContainer.appendChild(enemyElement);

    const enemy = {
        element: enemyElement,
        x: Math.random() * (gameContainer.offsetWidth - enemyWidth),
        y: -enemyHeight,
        width: enemyWidth,   // 적 너비 정보
        height: enemyHeight  // 적 높이 정보
    };
    enemies.push(enemy);
    enemy.element.style.left = enemy.x + 'px';
    enemy.element.style.top = enemy.y + 'px';
}

// 6. 적 업데이트 함수 (이전과 동일)
function updateEnemies() {
    const currentTime = Date.now();
    if (currentTime - lastEnemySpawnTime > enemySpawnInterval && enemies.length < 10) {
        lastEnemySpawnTime = currentTime;
        createEnemy();
    }
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.y += enemySpeed;
        if (enemy.y > gameContainer.offsetHeight) {
            enemy.element.remove();
            enemies.splice(i, 1);
        } else {
            enemy.element.style.top = enemy.y + 'px';
        }
    }
}

// --- 7. 스타 아이템 생성 함수 (신규) ---
function createStar() {
    const starElement = document.createElement('div');
    starElement.classList.add('star');
    starElement.textContent = '⭐'; // <<< 별 이모티콘으로 변경! (또는 '★' 사용 가능)
    gameContainer.appendChild(starElement);

    const star = {
        element: starElement,
        x: Math.random() * (gameContainer.offsetWidth - starWidth),
        y: -starHeight,
        width: starWidth,
        height: starHeight
    };
    stars.push(star);
    star.element.style.left = star.x + 'px';
    star.element.style.top = star.y + 'px';
}

// --- 8. 스타 아이템 업데이트 함수 (신규) ---
function updateStars() {
    // 일정 간격으로 새로운 스타 생성
    const currentTime = Date.now();
    if (currentTime - lastStarSpawnTime > starSpawnInterval && stars.length < 2) { // 화면에 최대 1~2개만 유지
        lastStarSpawnTime = currentTime;
        createStar();
    }

    // 모든 스타 이동 및 화면 이탈 처리
    for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i];
        star.y += starSpeed; // 스타를 아래로 이동

        if (star.y > gameContainer.offsetHeight) { // 화면 아래로 벗어나면
            star.element.remove(); // DOM에서 제거
            stars.splice(i, 1); // 배열에서 제거
        } else {
            star.element.style.top = star.y + 'px'; // 위치 업데이트
        }
    }
}


// 9. 충돌 감지 함수 (수정: 플레이어 vs 스타 충돌 추가)
function checkCollisions() {
    // 레이저와 적 충돌 (이전과 동일)
    for (let i = lasers.length - 1; i >= 0; i--) {
        const laser = lasers[i];
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (laser.x < enemy.x + enemy.width &&
                laser.x + laser.width > enemy.x &&
                laser.y < enemy.y + enemy.height &&
                laser.y + laser.height > enemy.y) {
                laser.element.remove(); lasers.splice(i, 1);
                enemy.element.remove(); enemies.splice(j, 1);
                puntuación += 10; scoreDisplay.textContent = puntuación;
                break;
            }
        }
    }

    // 플레이어와 적 충돌 (이전과 동일)
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (playerX < enemy.x + enemy.width &&
            playerX + playerWidth > enemy.x &&
            playerY < enemy.y + enemy.height &&
            playerY + playerHeight > enemy.y) {
            enemy.element.remove(); enemies.splice(i, 1);
            vida--; livesDisplay.textContent = vida;
            if (vida <= 0) isGameOver = true;
        }
    }

    // --- 플레이어와 스타 아이템 충돌 (신규) ---
    for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i];
        if (playerX < star.x + star.width &&
            playerX + playerWidth > star.x &&
            playerY < star.y + star.height &&
            playerY + playerHeight > star.y) {

            star.element.remove(); // 스타 아이템 제거
            stars.splice(i, 1);

            if (vida < maxVida) { // 최대 목숨 제한 체크
                vida++; // 목숨 증가
                livesDisplay.textContent = vida; // 목숨 표시 업데이트
            }
            // 여기에 아이템 획득 효과음 등을 추가할 수 있습니다.
        }
    }
    // --- 여기까지 신규 ---
}


// 10. 게임 루프 정의 (수정: updateStars 호출 추가)
function gameLoop() {
    if (isGameOver) {
        showGameOver();
        return;
    }

    // 플레이어 이동 처리
    if (keysPressed.ArrowLeft && playerX > 0) playerX -= playerSpeed;
    if (keysPressed.ArrowRight && playerX < gameContainer.offsetWidth - playerWidth) playerX += playerSpeed;
    if (keysPressed.ArrowUp && playerY > 0) playerY -= playerSpeed;
    if (keysPressed.ArrowDown && playerY < gameContainer.offsetHeight - playerHeight) playerY += playerSpeed;
    player.style.left = playerX + 'px';
    player.style.top = playerY + 'px';

    if (keysPressed[' ']) createLaser();

    updateLasers();
    updateEnemies();
    updateStars(); // 스타 아이템 업데이트 함수 호출 (신규)
    checkCollisions();

    gameLoopId = requestAnimationFrame(gameLoop);
}

// 11. 게임 오버 처리 함수 (이전과 동일)
function showGameOver() {
    finalScoreDisplay.textContent = puntuación;
    gameOverScreen.style.display = 'flex';
    gameContainer.style.display = 'none';
    document.getElementById('game-info').style.display = 'none';
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
}

// 12. 버튼 이벤트 리스너 (이전과 동일)
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// 초기 화면 설정 (이전과 동일)
gameContainer.style.display = 'none';
document.getElementById('game-info').style.display = 'none';
gameOverScreen.style.display = 'none';
startScreen.style.display = 'flex';

// script.js 의 createStar 함수 내부

// script.js 의 createStar 함수 내부

