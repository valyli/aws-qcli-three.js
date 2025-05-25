// main.js - 主游戏逻辑

// 初始化变量
let scene, camera, renderer;
let clock, deltaTime;
let isGameActive = false;
let gameTime = 0;

// 初始化函数
function init() {
    // 创建场景
    scene = new THREE.Scene();
    
    // 创建相机
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('game-container').appendChild(renderer.domElement);
    
    // 创建时钟用于计时
    clock = new THREE.Clock();
    
    // 设置光照
    setupLights();
    
    // 创建天空盒
    createSkybox();
    
    // 创建赛道
    createTrack();
    
    // 创建赛车
    createCar();
    
    // 设置相机初始位置
    positionCameraForStart();
    
    // 初始化控制系统
    initControls();
    
    // 初始化物理系统
    initPhysics();
    
    // 初始化UI
    initUI();
    
    // 添加窗口大小调整监听
    window.addEventListener('resize', onWindowResize, false);
    
    // 模拟加载完成
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('start-screen').style.display = 'flex';
    }, 2000);
    
    // 添加调试信息
    console.log("游戏初始化完成");
}

// 设置光照
function setupLights() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // 定向光（模拟太阳光）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    
    // 设置阴影属性
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    
    scene.add(directionalLight);
}

// 创建天空盒
function createSkybox() {
    // 使用简单的颜色渐变作为天空背景
    scene.background = new THREE.Color(0x87CEEB); // 天蓝色
}

// 窗口大小调整处理
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 游戏循环
function gameLoop() {
    requestAnimationFrame(gameLoop);
    
    // 计算时间增量
    deltaTime = clock.getDelta();
    
    // 如果游戏正在进行
    if (isGameActive) {
        // 更新游戏时间
        gameTime += deltaTime;
        updateTimeDisplay(gameTime);
        
        // 更新物理
        updatePhysics(deltaTime);
        
        // 更新赛车位置和旋转
        updateCar(deltaTime);
        
        // 更新相机位置
        updateCamera();
        
        // 检查游戏状态（如完成赛道）
        checkGameState();
        
        // 调试信息
        if (isUpPressed || isDownPressed) {
            console.log(`W/S按下: ${isUpPressed}/${isDownPressed}, 速度: ${carSpeed}`);
        }
    }
    
    // 渲染场景
    renderer.render(scene, camera);
}

// 开始游戏
function startGame() {
    isGameActive = true;
    gameTime = 0;
    
    // 隐藏开始屏幕
    document.getElementById('start-screen').style.display = 'none';
    
    // 显示游戏UI
    document.getElementById('game-ui').style.display = 'block';
    
    // 重置赛车位置
    resetCarPosition();
    
    // 重置相机位置
    positionCameraForStart();
    
    // 重置控制
    resetControls();
    
    console.log("游戏开始");
}

// 结束游戏
function endGame() {
    isGameActive = false;
    
    // 显示游戏结束屏幕
    document.getElementById('game-over-screen').classList.remove('hidden');
    
    // 显示最终时间
    document.getElementById('final-time-value').textContent = gameTime.toFixed(2) + " 秒";
    
    console.log("游戏结束");
}

// 重新开始游戏
function restartGame() {
    // 隐藏游戏结束屏幕
    document.getElementById('game-over-screen').classList.add('hidden');
    
    // 开始新游戏
    startGame();
}

// 初始化
window.onload = function() {
    init();
    gameLoop();
    
    // 添加开始按钮事件监听
    document.getElementById('start-button').addEventListener('click', startGame);
    
    // 添加重新开始按钮事件监听
    document.getElementById('restart-button').addEventListener('click', restartGame);
    
    console.log("页面加载完成");
};
