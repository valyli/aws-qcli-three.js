// track.js - 赛道相关代码

// 赛道对象
let track;
// 赛道边界
let trackBoundaries = [];
// 起点和终点位置
let startPosition, finishPosition;
// 检查点数组，用于记录赛道进度
let checkpoints = [];

// 创建赛道
function createTrack() {
    // 创建赛道地面
    const trackGeometry = new THREE.PlaneGeometry(100, 100);
    const trackMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        roughness: 0.8,
        metalness: 0.2
    });
    track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2; // 水平放置
    track.receiveShadow = true;
    scene.add(track);
    
    // 创建赛道纹理（赛道标记线）
    createTrackMarkings();
    
    // 创建赛道边界
    createTrackBoundaries();
    
    // 设置起点和终点
    setStartAndFinishPositions();
    
    // 创建检查点
    createCheckpoints();
}

// 创建赛道标记线
function createTrackMarkings() {
    // 创建一个简单的椭圆形赛道
    const trackWidth = 10;
    const trackOuterRadius = 40;
    const trackInnerRadius = trackOuterRadius - trackWidth;
    
    // 外圈白线
    const outerLineGeometry = new THREE.RingGeometry(trackOuterRadius - 0.5, trackOuterRadius, 64);
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const outerLine = new THREE.Mesh(outerLineGeometry, lineMaterial);
    outerLine.rotation.x = -Math.PI / 2;
    outerLine.position.y = 0.01; // 稍微抬高以避免z-fighting
    scene.add(outerLine);
    
    // 内圈白线
    const innerLineGeometry = new THREE.RingGeometry(trackInnerRadius, trackInnerRadius + 0.5, 64);
    const innerLine = new THREE.Mesh(innerLineGeometry, lineMaterial);
    innerLine.rotation.x = -Math.PI / 2;
    innerLine.position.y = 0.01;
    scene.add(innerLine);
    
    // 赛道表面（深灰色）
    const trackSurfaceGeometry = new THREE.RingGeometry(trackInnerRadius, trackOuterRadius, 64);
    const trackSurfaceMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        roughness: 0.9,
        metalness: 0.1,
        side: THREE.DoubleSide
    });
    const trackSurface = new THREE.Mesh(trackSurfaceGeometry, trackSurfaceMaterial);
    trackSurface.rotation.x = -Math.PI / 2;
    trackSurface.receiveShadow = true;
    scene.add(trackSurface);
    
    // 起跑线
    const startLineGeometry = new THREE.PlaneGeometry(trackWidth, 1);
    const startLineMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        side: THREE.DoubleSide
    });
    const startLine = new THREE.Mesh(startLineGeometry, startLineMaterial);
    startLine.position.set(0, 0.02, -(trackOuterRadius - trackWidth/2));
    startLine.rotation.x = -Math.PI / 2;
    scene.add(startLine);
    
    // 添加一些赛道装饰物（如轮胎墙）
    addTrackDecorations(trackInnerRadius, trackOuterRadius);
    
    // 添加广告牌
    createBillboards(trackOuterRadius);
}

// 添加赛道装饰物
function addTrackDecorations(innerRadius, outerRadius) {
    // 在赛道内侧添加一些轮胎墙
    const tireWallGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
    const tireWallMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
    
    const numTires = 40;
    for (let i = 0; i < numTires; i++) {
        const angle = (i / numTires) * Math.PI * 2;
        const x = Math.cos(angle) * (innerRadius + 1);
        const z = Math.sin(angle) * (innerRadius + 1);
        
        const tireWall = new THREE.Mesh(tireWallGeometry, tireWallMaterial);
        tireWall.position.set(x, 0.5, z);
        tireWall.castShadow = true;
        tireWall.receiveShadow = true;
        scene.add(tireWall);
    }
    
    // 添加一些观众看台
    const standGeometry = new THREE.BoxGeometry(5, 2, 10);
    const standMaterial = new THREE.MeshStandardMaterial({ color: 0x4682B4 });
    
    // 添加四个看台在赛道四周
    const standPositions = [
        { x: 0, z: -outerRadius - 5, rotation: 0 },
        { x: 0, z: outerRadius + 5, rotation: Math.PI },
        { x: -outerRadius - 5, z: 0, rotation: Math.PI / 2 },
        { x: outerRadius + 5, z: 0, rotation: -Math.PI / 2 }
    ];
    
    standPositions.forEach(pos => {
        const stand = new THREE.Mesh(standGeometry, standMaterial);
        stand.position.set(pos.x, 1, pos.z);
        stand.rotation.y = pos.rotation;
        stand.castShadow = true;
        stand.receiveShadow = true;
        scene.add(stand);
    });
}

// 创建广告牌
function createBillboards(trackOuterRadius) {
    // 加载手机图片纹理
    const textureLoader = new THREE.TextureLoader();
    
    // 加载马的图片纹理
    const horseTexture = textureLoader.load('assets/textures/马_1755153254044.webp', 
        function(texture) {
            console.log('马纹理加载成功');
        },
        function(progress) {
            console.log('纹理加载进度:', progress);
        },
        function(error) {
            console.error('纹理加载失败:', error);
        }
    );
    
    // 创建广告牌几何体（矩形平面）
    const billboardGeometry = new THREE.PlaneGeometry(8, 6);
    const billboardMaterial = new THREE.MeshStandardMaterial({ 
        map: horseTexture,
        side: THREE.DoubleSide,
        transparent: true
    });
    
    // 在赛道周围创建多个广告牌
    const billboardPositions = [
        { x: 0, z: -(trackOuterRadius + 8), rotation: 0 },
        { x: trackOuterRadius + 8, z: 0, rotation: -Math.PI / 2 },
        { x: 0, z: trackOuterRadius + 8, rotation: Math.PI },
        { x: -(trackOuterRadius + 8), z: 0, rotation: Math.PI / 2 }
    ];
    
    billboardPositions.forEach((pos, index) => {
        const billboard = new THREE.Mesh(billboardGeometry, billboardMaterial);
        billboard.position.set(pos.x, 3, pos.z); // 高度设为3米
        billboard.rotation.y = pos.rotation;
        billboard.castShadow = true;
        billboard.receiveShadow = true;
        
        // 添加广告牌支架
        const poleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 6, 8);
        const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(pos.x, 3, pos.z);
        pole.castShadow = true;
        pole.receiveShadow = true;
        
        scene.add(billboard);
        scene.add(pole);
        
        console.log(`创建广告牌 ${index + 1} 在位置:`, pos);
    });
}

// 创建赛道边界（用于碰撞检测）
function createTrackBoundaries() {
    const trackOuterRadius = 40;
    const trackInnerRadius = 30;
    
    // 创建外边界和内边界的碰撞检测对象
    // 这里使用不可见的圆柱体作为边界
    const segmentCount = 32;
    
    // 外边界
    for (let i = 0; i < segmentCount; i++) {
        const angle1 = (i / segmentCount) * Math.PI * 2;
        const angle2 = ((i + 1) / segmentCount) * Math.PI * 2;
        
        const x1 = Math.cos(angle1) * trackOuterRadius;
        const z1 = Math.sin(angle1) * trackOuterRadius;
        const x2 = Math.cos(angle2) * trackOuterRadius;
        const z2 = Math.sin(angle2) * trackOuterRadius;
        
        // 创建边界段
        const boundaryGeometry = new THREE.BoxGeometry(
            Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2)),
            2,
            0.5
        );
        const boundaryMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 0.0 // 不可见
        });
        
        const boundary = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
        boundary.position.set((x1 + x2) / 2, 1, (z1 + z2) / 2);
        boundary.lookAt(new THREE.Vector3(0, 1, 0));
        boundary.rotation.y = Math.atan2(z2 - z1, x2 - x1) + Math.PI / 2;
        
        scene.add(boundary);
        trackBoundaries.push(boundary);
    }
    
    // 内边界
    for (let i = 0; i < segmentCount; i++) {
        const angle1 = (i / segmentCount) * Math.PI * 2;
        const angle2 = ((i + 1) / segmentCount) * Math.PI * 2;
        
        const x1 = Math.cos(angle1) * trackInnerRadius;
        const z1 = Math.sin(angle1) * trackInnerRadius;
        const x2 = Math.cos(angle2) * trackInnerRadius;
        const z2 = Math.sin(angle2) * trackInnerRadius;
        
        // 创建边界段
        const boundaryGeometry = new THREE.BoxGeometry(
            Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2)),
            2,
            0.5
        );
        const boundaryMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 0.0 // 不可见
        });
        
        const boundary = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
        boundary.position.set((x1 + x2) / 2, 1, (z1 + z2) / 2);
        boundary.lookAt(new THREE.Vector3(0, 1, 0));
        boundary.rotation.y = Math.atan2(z2 - z1, x2 - x1) - Math.PI / 2;
        
        scene.add(boundary);
        trackBoundaries.push(boundary);
    }
}

// 设置起点和终点位置
function setStartAndFinishPositions() {
    // 起点位置（赛道底部）
    startPosition = new THREE.Vector3(0, 0, -35);
    
    // 终点位置（与起点相同，完成一圈）
    finishPosition = startPosition.clone();
}

// 创建检查点（用于跟踪赛车进度）
function createCheckpoints() {
    const trackRadius = 35; // 赛道中心线半径
    const numCheckpoints = 8;
    
    for (let i = 0; i < numCheckpoints; i++) {
        const angle = (i / numCheckpoints) * Math.PI * 2;
        const x = Math.cos(angle) * trackRadius;
        const z = Math.sin(angle) * trackRadius;
        
        // 创建不可见的检查点
        const checkpointGeometry = new THREE.BoxGeometry(10, 5, 1);
        const checkpointMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00,
            transparent: true,
            opacity: 0.0 // 不可见
        });
        
        const checkpoint = new THREE.Mesh(checkpointGeometry, checkpointMaterial);
        checkpoint.position.set(x, 2.5, z);
        checkpoint.lookAt(new THREE.Vector3(0, 2.5, 0));
        checkpoint.userData = { checkpointId: i, passed: false };
        
        scene.add(checkpoint);
        checkpoints.push(checkpoint);
    }
}

// 检查赛车是否通过检查点
function checkCheckpointCollision(carPosition) {
    for (let i = 0; i < checkpoints.length; i++) {
        const checkpoint = checkpoints[i];
        
        // 如果检查点尚未通过
        if (!checkpoint.userData.passed) {
            // 简单的距离检查
            const distance = carPosition.distanceTo(checkpoint.position);
            
            if (distance < 7) { // 检查点触发距离
                checkpoint.userData.passed = true;
                console.log(`通过检查点 ${checkpoint.userData.checkpointId}`);
                
                // 检查是否所有检查点都已通过
                if (checkAllCheckpointsPassed()) {
                    // 如果在终点附近，完成比赛
                    const distanceToFinish = carPosition.distanceTo(finishPosition);
                    if (distanceToFinish < 10) {
                        console.log("完成比赛!");
                        endGame();
                    }
                }
                
                break;
            }
        }
    }
}

// 检查是否所有检查点都已通过
function checkAllCheckpointsPassed() {
    for (let i = 0; i < checkpoints.length; i++) {
        if (!checkpoints[i].userData.passed) {
            return false;
        }
    }
    return true;
}

// 重置检查点状态
function resetCheckpoints() {
    for (let i = 0; i < checkpoints.length; i++) {
        checkpoints[i].userData.passed = false;
    }
}

// 检查赛车是否与赛道边界碰撞
function checkTrackBoundaryCollision(carPosition, carRadius = 1.5) {
    for (let i = 0; i < trackBoundaries.length; i++) {
        const boundary = trackBoundaries[i];
        
        // 计算赛车到边界的距离
        const boundaryPos = boundary.position.clone();
        const distance = carPosition.distanceTo(boundaryPos);
        
        // 如果距离小于赛车半径加上一些余量，则发生碰撞
        if (distance < carRadius + 1) {
            // 返回碰撞的边界对象，以便物理系统处理碰撞响应
            return boundary;
        }
    }
    
    // 没有碰撞
    return null;
}
