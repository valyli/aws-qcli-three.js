// physics.js - 物理系统

// 物理常量
const GRAVITY = 9.8;
const FRICTION_COEFFICIENT = 0.95; // 地面摩擦系数
const AIR_RESISTANCE = 0.99;       // 空气阻力系数
const RESTITUTION = 0.3;           // 碰撞恢复系数

// 赛车物理状态
let isCarOnGround = true;
let carVerticalVelocity = 0;
let carLastPosition = new THREE.Vector3();

// 初始化物理系统
function initPhysics() {
    console.log("物理系统初始化");
    // 只有在car存在时才初始化位置
    if (car && car.position) {
        carLastPosition.copy(car.position);
    } else {
        carLastPosition.set(0, 0.5, -35); // 默认位置
    }
}

// 更新物理
function updatePhysics(deltaTime) {
    // 保存上一帧位置用于碰撞检测
    carLastPosition.copy(car.position);
    
    // 处理赛车控制
    handleCarControls(deltaTime);
    
    // 应用重力和地面反作用力
    applyGravity(deltaTime);
    
    // 应用摩擦力和空气阻力
    applyFriction(deltaTime);
    
    // 检测并处理碰撞
    handleCollisions();
    
    // 检查游戏状态
    checkGameState();
}

// 应用重力
function applyGravity(deltaTime) {
    // 检查赛车是否在地面上
    const groundHeight = 0.5; // 赛车中心到地面的高度
    
    if (car.position.y > groundHeight) {
        // 赛车在空中，应用重力
        isCarOnGround = false;
        carVerticalVelocity -= GRAVITY * deltaTime;
        car.position.y += carVerticalVelocity * deltaTime;
        
        // 检查是否落地
        if (car.position.y <= groundHeight) {
            car.position.y = groundHeight;
            isCarOnGround = true;
            
            // 计算冲击力并应用到水平速度
            if (carVerticalVelocity < -3) {
                // 冲击力与垂直速度成正比
                const impactFactor = Math.abs(carVerticalVelocity) / 10;
                carSpeed *= (1 - impactFactor);
                
                // 如果冲击力足够大，可以添加弹跳效果
                if (carVerticalVelocity < -8) {
                    carVerticalVelocity = -carVerticalVelocity * RESTITUTION;
                } else {
                    carVerticalVelocity = 0;
                }
            } else {
                carVerticalVelocity = 0;
            }
        }
    } else {
        // 确保赛车在地面上
        car.position.y = groundHeight;
        isCarOnGround = true;
        carVerticalVelocity = 0;
    }
}

// 应用摩擦力和空气阻力
function applyFriction(deltaTime) {
    if (isCarOnGround) {
        // 地面摩擦力 - 随速度增加而增加
        carSpeed *= Math.pow(FRICTION_COEFFICIENT, deltaTime * 60);
    } else {
        // 空中阻力较小
        carSpeed *= Math.pow(AIR_RESISTANCE, deltaTime * 60);
    }
    
    // 如果速度很小，则停止
    if (Math.abs(carSpeed) < 0.1) {
        carSpeed = 0;
    }
}

// 处理碰撞
function handleCollisions() {
    // 检查与赛道边界的碰撞
    const collidedBoundary = checkTrackBoundaryCollision(car.position);
    
    if (collidedBoundary) {
        // 计算碰撞响应
        handleBoundaryCollision(collidedBoundary);
    }
    
    // 检查与其他物体的碰撞（如障碍物）
    // 这里可以添加更多碰撞检测逻辑
}

// 处理与赛道边界的碰撞
function handleBoundaryCollision(boundary) {
    // 计算碰撞法线
    const normal = calculateCollisionNormal(boundary);
    
    // 计算入射速度向量
    const velocityVector = carDirection.clone().multiplyScalar(carSpeed);
    
    // 计算反射速度向量 (反射公式: v' = v - 2(v·n)n)
    const dot = velocityVector.dot(normal);
    const reflection = velocityVector.clone().sub(normal.multiplyScalar(2 * dot));
    
    // 应用恢复系数减少速度
    reflection.multiplyScalar(RESTITUTION);
    
    // 更新车辆速度和方向
    carSpeed = reflection.length() * 0.5; // 碰撞后减速
    
    if (carSpeed > 0.1) {
        carDirection.copy(reflection.normalize());
    }
    
    // 将车辆推离边界
    car.position.copy(carLastPosition);
    
    // 添加一点随机扰动，使碰撞更自然
    car.position.x += (Math.random() - 0.5) * 0.1;
    car.position.z += (Math.random() - 0.5) * 0.1;
    
    // 更新位置变量
    carPosition.copy(car.position);
}

// 找到最近的边界
function findNearestBoundary(position) {
    let nearestBoundary = null;
    let minDistance = Infinity;
    
    // 遍历所有边界
    for (let i = 0; i < trackBoundaries.length; i++) {
        const boundary = trackBoundaries[i];
        const distance = position.distanceTo(boundary.position);
        
        if (distance < minDistance) {
            minDistance = distance;
            nearestBoundary = boundary;
        }
    }
    
    return nearestBoundary;
}

// 计算碰撞法线
function calculateCollisionNormal(boundary) {
    // 简化版本：假设法线指向赛道中心
    const trackCenter = new THREE.Vector3(0, 0, 0);
    const normal = new THREE.Vector3();
    
    // 如果是外边界，法线指向中心
    if (boundary.position.distanceTo(trackCenter) > 35) {
        normal.subVectors(trackCenter, boundary.position).normalize();
    } 
    // 如果是内边界，法线指向外部
    else {
        normal.subVectors(boundary.position, trackCenter).normalize();
    }
    
    return normal;
}

// 检查游戏状态
function checkGameState() {
    // 检查是否完成比赛
    // 这部分逻辑在 track.js 的 checkCheckpointCollision 函数中处理
    
    // 检查是否出界
    if (Math.abs(car.position.x) > 100 || Math.abs(car.position.z) > 100) {
        console.log("赛车出界!");
        resetCarPosition();
    }
}

// 更新相机位置
function updateCamera() {
    // 计算相机位置 - 在车后方和上方
    const distance = 10; // 相机到车的距离
    const height = 5;    // 相机高度
    
    // 计算车头方向
    const angle = car.rotation.y;
    const offsetX = Math.sin(angle) * distance;
    const offsetZ = Math.cos(angle) * distance;
    
    // 设置相机位置
    camera.position.set(
        car.position.x - offsetX,
        car.position.y + height,
        car.position.z - offsetZ
    );
    
    // 相机看向赛车
    camera.lookAt(car.position);
}

// 为开始画面设置相机位置
function positionCameraForStart() {
    // 将相机放在赛道上方，俯视整个赛道
    camera.position.set(0, 50, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}
