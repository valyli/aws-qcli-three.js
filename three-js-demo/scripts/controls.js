// controls.js - 控制系统

// 控制键状态
let isUpPressed = false;
let isDownPressed = false;
let isLeftPressed = false;
let isRightPressed = false;
let isSpacePressed = false;

// 初始化控制系统
function initControls() {
    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}

// 处理按键按下事件
function handleKeyDown(event) {
    switch(event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            isUpPressed = true;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            isDownPressed = true;
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            isLeftPressed = true;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            isRightPressed = true;
            break;
        case ' ':
            isSpacePressed = true;
            break;
    }
}

// 处理按键释放事件
function handleKeyUp(event) {
    switch(event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            isUpPressed = false;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            isDownPressed = false;
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            isLeftPressed = false;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            isRightPressed = false;
            break;
        case ' ':
            isSpacePressed = false;
            break;
    }
}

// 重置控制状态
function resetControls() {
    isUpPressed = false;
    isDownPressed = false;
    isLeftPressed = false;
    isRightPressed = false;
    isSpacePressed = false;
}

// 处理赛车控制 - 增强版本，添加物理效果
function handleCarControls(deltaTime) {
    // 获取车头方向
    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(car.quaternion);
    
    // 初始化加速度
    let accel = 0;
    
    // W键 - 前进加速
    if (isUpPressed) {
        // 如果车辆正在后退，先施加更大的制动力
        if (carSpeed < 0) {
            accel = brakeForce * deltaTime;
        } else {
            // 正常加速
            accel = acceleration * deltaTime;
        }
    }
    
    // S键 - 后退加速
    if (isDownPressed) {
        // 如果车辆正在前进，先施加制动力
        if (carSpeed > 0) {
            accel = -brakeForce * deltaTime;
        } else {
            // 正常后退加速（后退速度较慢）
            accel = -acceleration * 0.7 * deltaTime;
        }
    }
    
    // 应用加速度
    if (accel !== 0) {
        carSpeed += accel;
        
        // 限制最大速度
        if (carSpeed > maxSpeed) {
            carSpeed = maxSpeed;
        } else if (carSpeed < -maxSpeed / 2) { // 后退速度限制为最大速度的一半
            carSpeed = -maxSpeed / 2;
        }
    }
    
    // 手刹 - 快速减速
    if (isSpacePressed && Math.abs(carSpeed) > 0.1) {
        carSpeed *= 0.95;
    }
    
    // 转向 - 只有当车辆有速度时才能转向
    if (Math.abs(carSpeed) > 0.1) {
        // 转向系数 - 速度越快，转向越灵敏，但有上限
        const speedFactor = Math.min(Math.abs(carSpeed) / maxSpeed, 0.8);
        const turnFactor = turnSpeed * speedFactor * deltaTime;
        
        // 左转
        if (isLeftPressed) {
            // 根据前进或后退调整转向方向
            car.rotation.y += (carSpeed > 0) ? turnFactor : -turnFactor;
        }
        
        // 右转
        if (isRightPressed) {
            // 根据前进或后退调整转向方向
            car.rotation.y += (carSpeed > 0) ? -turnFactor : turnFactor;
        }
    }
    
    // 计算移动向量
    if (Math.abs(carSpeed) > 0) {
        // 根据车头方向和速度计算移动向量
        const moveVector = forward.clone().multiplyScalar(carSpeed * deltaTime);
        
        // 更新位置
        car.position.add(moveVector);
        
        // 更新方向向量（用于其他计算）
        carDirection = forward.clone().normalize();
    }
    
    // 更新位置变量
    carPosition.copy(car.position);
}
