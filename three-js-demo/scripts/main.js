// main.js - 主游戏逻辑

// 初始化变量
let scene, camera, renderer;
let clock, deltaTime;
let isGameActive = false;
let gameTime = 0;

// 初始化函数
function init() {
    console.log('开始初始化游戏...');
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
    console.log('即将调用 createCar() 函数...');
    createCar();
    console.log('createCar() 函数调用完成');
    
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

    // Add this function to capture render for the render server
    captureRender();
    
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
    
    // 如果在渲染模式下且socket已连接，发送当前帧
    if (socket && socket.connected && location.search.includes('?size=')) {
        try {
            const dataURL = renderer.domElement.toDataURL('image/png');
            socket.emit('newFrame', { png: dataURL });
        } catch (error) {
            console.error('Error sending frame:', error);
        }
    }
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
function initializeGame() {
    // 检查所有必要的函数是否存在
    if (typeof createTrack === 'undefined' || 
        typeof createCar === 'undefined' || 
        typeof initControls === 'undefined' || 
        typeof initPhysics === 'undefined' || 
        typeof initUI === 'undefined') {
        console.log('等待所有脚本加载完成...');
        setTimeout(initializeGame, 100);
        return;
    }
    
    init();
    gameLoop();
    
    // 添加开始按钮事件监听
    document.getElementById('start-button').addEventListener('click', startGame);
    
    // 添加重新开始按钮事件监听
    document.getElementById('restart-button').addEventListener('click', restartGame);
    
    console.log("游戏初始化完成");
}

window.onload = function() {
    console.log("页面加载完成，开始初始化游戏...");
    initializeGame();
};

// 全局变量，用于存储socket连接
let socket;

// Capture render frames sending to the server
function captureRender() {
    // 检查URL中是否包含size参数（渲染服务器模式）
    const sizeParam = location.search.split('?size=')[1];
    
    if (!sizeParam) {
        console.log('No size parameter found in URL, not in render mode');
        return;
    }
    
    console.log('Render mode detected with size:', sizeParam);
    
    // 解析宽度和高度
    const width = parseInt(sizeParam.split('x')[0]);
    const height = parseInt(sizeParam.split('x')[1]);
    
    // 调整渲染器大小以匹配请求的尺寸
    renderer.setSize(width, height);
    
    // 连接到Socket.io服务器
    socket = io();
    
    // 向服务器发送问候
    socket.emit('greetings', {});
    
    // 当服务器请求下一帧时
    socket.on('nextFrame', function(ready) {
        console.log('Server requested next frame');
        
        // 确保场景已经准备好
        if (!scene || !camera || !renderer) {
            console.error('Scene, camera or renderer not initialized');
            return;
        }
        
        // 渲染一帧
        renderer.render(scene, camera);
        
        // 将渲染结果作为PNG发送到服务器
        try {
            const dataURL = renderer.domElement.toDataURL('image/png');
            socket.emit('newFrame', { png: dataURL });
            console.log('Frame sent to server');
        } catch (error) {
            console.error('Error capturing frame:', error);
        }
    });
    
    // 监听断开连接事件
    socket.on('disconnect', function() {
        console.log('Disconnected from render server');
    });
};