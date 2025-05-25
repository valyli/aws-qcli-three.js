// ui.js - 用户界面代码

// 初始化UI
function initUI() {
    // 隐藏游戏UI，直到游戏开始
    document.getElementById('game-ui').style.display = 'none';
    
    // 隐藏游戏结束屏幕
    document.getElementById('game-over-screen').classList.add('hidden');
    
    // 设置进度条动画
    animateProgressBar();
}

// 动画显示进度条
function animateProgressBar() {
    const progressBar = document.querySelector('.progress');
    let width = 0;
    
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
        } else {
            width += 2;
            progressBar.style.width = width + '%';
        }
    }, 50);
}

// 更新时间显示
function updateTimeDisplay(time) {
    document.getElementById('time-value').textContent = time.toFixed(2) + " 秒";
}

// 显示游戏结束界面
function showGameOverScreen(finalTime) {
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('final-time-value').textContent = finalTime.toFixed(2) + " 秒";
}

// 添加声音效果
function addSoundEffects() {
    // 在简化版本中，我们不实现声音效果
    // 这里是声音效果的占位函数
}

// 播放引擎声音
function playEngineSound(speed) {
    // 在简化版本中，我们不实现声音效果
    // 这里是声音效果的占位函数
}

// 播放碰撞声音
function playCollisionSound() {
    // 在简化版本中，我们不实现声音效果
    // 这里是声音效果的占位函数
}

// 显示倒计时
function showCountdown(callback) {
    // 创建倒计时元素
    const countdownElement = document.createElement('div');
    countdownElement.className = 'countdown';
    countdownElement.style.position = 'absolute';
    countdownElement.style.top = '50%';
    countdownElement.style.left = '50%';
    countdownElement.style.transform = 'translate(-50%, -50%)';
    countdownElement.style.fontSize = '100px';
    countdownElement.style.color = 'white';
    countdownElement.style.textShadow = '2px 2px 4px black';
    countdownElement.style.zIndex = '100';
    document.getElementById('game-container').appendChild(countdownElement);
    
    // 倒计时逻辑
    let count = 3;
    countdownElement.textContent = count;
    
    const interval = setInterval(() => {
        count--;
        
        if (count > 0) {
            countdownElement.textContent = count;
        } else if (count === 0) {
            countdownElement.textContent = 'GO!';
        } else {
            clearInterval(interval);
            countdownElement.remove();
            if (callback) callback();
        }
    }, 1000);
}
