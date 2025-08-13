// car.js - 赛车相关代码

// 赛车对象
let car;
// 赛车速度和方向
let carSpeed = 0;
let carDirection = new THREE.Vector3(0, 0, 1);
// 赛车物理参数
const maxSpeed = 50;
const acceleration = 20;
const deceleration = 10;
const brakeForce = 40;
const turnSpeed = 2.5;
// 赛车位置
let carPosition = new THREE.Vector3();
// 赛车轮子
let wheels = [];
// 赛车尾气粒子效果
let exhaustParticles;

// 创建赛车
function createCar() {
    console.log('开始创建赛车...');
    
    // 检查 FBX 加载器是否可用
    if (typeof THREE.FBXLoader === 'undefined') {
        console.error('FBXLoader 未加载，使用备用模型');
        createFallbackCar();
        return;
    }
    
    // 使用 FBX 加载器加载绿色车辆模型
    const fbxLoader = new THREE.FBXLoader();
    const modelPath = 'assets/models/绿色车辆_1755096149592.fbx';
    
    console.log('尝试加载 FBX 模型:', modelPath);
    
    fbxLoader.load(
        modelPath,
        function(object) {
            // 模型加载成功
            console.log('模型加载成功，对象:', object);
            car = object;
            
            // 设置模型属性
            car.scale.set(0.4, 0.4, 0.4); // 设置合适的模型大小，避免被卡住
            console.log('模型缩放设置为 0.4');
            car.castShadow = true;
            car.receiveShadow = true;
            
            // 为模型的所有子对象设置阴影
            car.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            // 将模型添加到场景中
            scene.add(car);
            
            // 添加尾气粒子效果
            createExhaustEffect();
            
            // 设置赛车初始位置
            resetCarPosition();
            
            console.log('绿色车辆模型加载完成');
        },
        function(progress) {
            // 加载进度
            if (progress.total > 0) {
                const percent = (progress.loaded / progress.total * 100).toFixed(1);
                console.log('模型加载进度:', percent + '%');
            }
        },
        function(error) {
            // 加载失败，使用备用的简单模型
            console.error('模型加载失败，错误信息:', error);
            console.log('使用备用模型');
            createFallbackCar();
        }
    );
}

// 备用的简单赛车模型
function createFallbackCar() {
    // 创建一个简单的赛车模型（原有代码）
    console.log('创建绿色备用赛车模型');
    const carBodyGeometry = new THREE.BoxGeometry(3, 1, 5);
    const carBodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x00aa00, // 明亮的绿色
        roughness: 0.3,
        metalness: 0.8
    });
    car = new THREE.Mesh(carBodyGeometry, carBodyMaterial);
    car.castShadow = true;
    car.receiveShadow = true;
    scene.add(car);
    
    // 添加车顶
    const carTopGeometry = new THREE.BoxGeometry(2, 0.7, 2);
    const carTopMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x00ff00,
        roughness: 0.5,
        metalness: 0.7
    });
    const carTop = new THREE.Mesh(carTopGeometry, carTopMaterial);
    carTop.position.set(0, 0.85, -0.5);
    carTop.castShadow = true;
    car.add(carTop);
    
    // 添加前挡风玻璃
    const windshieldGeometry = new THREE.PlaneGeometry(2, 0.7);
    const windshieldMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x88ccff,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
    windshield.position.set(0, 0.85, 0.5);
    windshield.rotation.x = Math.PI / 4;
    car.add(windshield);
    
    // 添加车轮
    createWheels();
    
    // 添加尾气粒子效果
    createExhaustEffect();
    
    // 设置赛车初始位置
    resetCarPosition();
}

// 创建车轮（仅在备用模型中使用）
function createWheels() {
    const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        roughness: 0.9,
        metalness: 0.1
    });
    
    // 车轮位置
    const wheelPositions = [
        { x: -1.5, y: -0.25, z: 1.5 },  // 左前
        { x: 1.5, y: -0.25, z: 1.5 },   // 右前
        { x: -1.5, y: -0.25, z: -1.5 }, // 左后
        { x: 1.5, y: -0.25, z: -1.5 }   // 右后
    ];
    
    // 创建四个车轮
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(pos.x, pos.y, pos.z);
        wheel.rotation.z = Math.PI / 2; // 旋转车轮使其正确朝向
        wheel.castShadow = true;
        car.add(wheel);
        wheels.push(wheel);
    });
}

// 创建尾气效果
function createExhaustEffect() {
    // 简单的尾气效果（使用小立方体代替粒子系统，简化实现）
    exhaustParticles = new THREE.Group();
    car.add(exhaustParticles);
    
    // 尾气位置（车后部）
    exhaustParticles.position.set(0, 0, -2.6);
}

// 更新尾气效果
function updateExhaustEffect(deltaTime) {
    // 清除旧的尾气粒子
    while (exhaustParticles.children.length > 0) {
        exhaustParticles.remove(exhaustParticles.children[0]);
    }
    
    // 如果车速足够快，创建新的尾气粒子
    if (Math.abs(carSpeed) > 10) {
        const particleCount = Math.min(5, Math.floor(Math.abs(carSpeed) / 5));
        
        for (let i = 0; i < particleCount; i++) {
            const particleSize = 0.1 + Math.random() * 0.2;
            const particleGeometry = new THREE.BoxGeometry(particleSize, particleSize, particleSize);
            const particleMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x888888,
                transparent: true,
                opacity: 0.5 + Math.random() * 0.5
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // 随机位置偏移
            particle.position.x = (Math.random() - 0.5) * 0.5;
            particle.position.y = Math.random() * 0.5;
            particle.position.z = -Math.random() * 0.5;
            
            exhaustParticles.add(particle);
        }
    }
}

// 更新车轮旋转（仅在备用模型中使用）
function updateWheelRotation(deltaTime) {
    // 只有在使用备用模型时才更新车轮
    if (wheels.length === 0) return;
    
    // 根据车速旋转车轮
    const wheelRotationSpeed = carSpeed * 0.5;
    
    wheels.forEach(wheel => {
        wheel.rotation.x += wheelRotationSpeed * deltaTime;
    });
    
    // 转向时调整前轮角度
    if (isLeftPressed) {
        wheels[0].rotation.y = Math.PI / 6; // 左前轮
        wheels[1].rotation.y = Math.PI / 6; // 右前轮
    } else if (isRightPressed) {
        wheels[0].rotation.y = -Math.PI / 6; // 左前轮
        wheels[1].rotation.y = -Math.PI / 6; // 右前轮
    } else {
        wheels[0].rotation.y = 0; // 左前轮
        wheels[1].rotation.y = 0; // 右前轮
    }
}

// 更新赛车
function updateCar(deltaTime) {
    // 更新车轮旋转
    updateWheelRotation(deltaTime);
    
    // 更新尾气效果
    updateExhaustEffect(deltaTime);
    
    // 更新车速显示
    updateSpeedDisplay();
    
    // 检查检查点碰撞
    checkCheckpointCollision(car.position);
}

// 重置赛车位置
function resetCarPosition() {
    // 将赛车放在起点位置
    car.position.copy(startPosition);
    car.position.y = 0.5; // 车身高度
    
    // 设置初始朝向（沿着赛道方向）
    car.rotation.y = 0;
    
    // 重置速度和方向
    carSpeed = 0;
    carDirection = new THREE.Vector3(0, 0, 1);
    
    // 更新车辆位置变量
    carPosition = car.position.clone();
    
    // 重置检查点
    resetCheckpoints();
}

// 更新速度显示
function updateSpeedDisplay() {
    const speedKmh = Math.abs(Math.round(carSpeed * 3.6)); // 转换为km/h
    document.getElementById('speed-value').textContent = speedKmh;
}
