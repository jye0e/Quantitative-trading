/**
 * 四边形动态变化科技动效 - 光遇风格
 * 使用方法：
 * 1. 在HTML文件中引入此脚本
 * 2. 确保页面包含一个带有id="polygonCanvas"的canvas元素
 * 3. 或者调用initPolygonBackground(containerId)指定容器ID
 */

/**
 * 初始化四边形动态变化动效
 * @param {string} [containerId] - 可选，容器元素的ID，默认为'polygonCanvas'
 * @param {Object} [customConfig] - 可选，自定义配置参数
 */
function initPolygonBackground(containerId = 'polygonCanvas', customConfig = {}) {
    // 获取canvas元素
    let canvas = document.getElementById(containerId);
    
    // 如果没有找到canvas元素，创建一个新的
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = containerId;
        canvas.className = 'polygon-canvas';
        
        // 创建容器
        const container = document.createElement('div');
        container.className = 'polygon-background';
        container.appendChild(canvas);
        
        // 添加到body
        document.body.appendChild(container);
        
        // 添加基础样式
        if (!document.getElementById('polygonBackgroundStyles')) {
            const style = document.createElement('style');
            style.id = 'polygonBackgroundStyles';
            style.textContent = `
                .polygon-background {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: -1;
                    overflow: hidden;
                    pointer-events: none;
                }
                
                .polygon-canvas {
                    width: 100%;
                    height: 100%;
                    display: block;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    const ctx = canvas.getContext('2d');
    
    // 设置canvas尺寸
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 默认四边形配置 - 科技光遇风格
    const defaultConfig = {
        numQuadrilaterals: 15,  // 四边形数量
        minSize: 80,            // 最小尺寸
        maxSize: 250,           // 最大尺寸
        // 光遇风格的颜色 - 主要是柔和的蓝色、紫色调
        colors: [
            '#7bb3ff', '#8cc5ff', '#9ed7ff', '#afeeff',
            '#b9d5ff', '#c7bdff', '#d5a6ff', '#e38fff'
        ],
        glowColors: [
            'rgba(123, 179, 255, 0.3)', 'rgba(139, 197, 255, 0.3)',
            'rgba(158, 215, 255, 0.3)', 'rgba(175, 238, 255, 0.3)',
            'rgba(185, 213, 255, 0.3)', 'rgba(199, 189, 255, 0.3)',
            'rgba(213, 166, 255, 0.3)', 'rgba(227, 143, 255, 0.3)'
        ],
        strokeColor: '#ffffff',  // 线条颜色
        strokeWidth: 1.2,        // 线条宽度
        glowRadius: 15,          // 发光半径
        transitionDuration: 3000, // 过渡持续时间(ms)
        baseSpeed: 0.02,         // 基础速度
        variation: 0.04,         // 速度变化范围
        fadeInSpeed: 0.02,       // 淡入速度
        fadeOutSpeed: 0.01       // 淡出速度
    };
    
    // 合并配置
    const config = { ...defaultConfig, ...customConfig };
    
    // 创建四边形数组
    const quadrilaterals = [];
    
    // 生成随机点
    function generateRandomPoint() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        };
    }
    
    // 生成四边形的四个顶点
    function generateQuadrilateralPoints(centerX, centerY, size) {
        const points = [];
        const angleOffset = Math.random() * Math.PI; // 随机旋转角度
        
        // 生成四边形的四个顶点，考虑一些随机性使它们不完全对称
        for (let i = 0; i < 4; i++) {
            const angle = angleOffset + (i / 4) * Math.PI * 2 + (Math.random() - 0.5) * 0.3; // 添加一些角度变化
            const radius = size * (0.8 + Math.random() * 0.4); // 半径稍微随机化
            points.push({
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            });
        }
        
        return points;
    }
    
    // 创建四边形对象
    function createQuadrilateral() {
        const centerX = Math.random() * canvas.width;
        const centerY = Math.random() * canvas.height;
        const size = config.minSize + Math.random() * (config.maxSize - config.minSize);
        const colorIndex = Math.floor(Math.random() * config.colors.length);
        const speed = (Math.random() - 0.5) * config.variation + config.baseSpeed;
        
        const currentPoints = generateQuadrilateralPoints(centerX, centerY, size);
        const targetPoints = generateQuadrilateralPoints(centerX, centerY, size);
        
        return {
            centerX,
            centerY,
            currentPoints,      // 当前位置的点
            targetPoints,       // 目标位置的点
            nextTargetPoints: null, // 下一个目标点
            color: config.colors[colorIndex],
            glowColor: config.glowColors[colorIndex],
            speed,
            transitionProgress: 1, // 过渡进度(0-1)
            alpha: 0,             // 透明度
            fadeIn: true,         // 是否正在淡入
            fadeOut: false,       // 是否正在淡出
            lastTransitionTime: Date.now(), // 上次过渡开始时间
            lifetime: 0                      // 生命周期(ms)
        };
    }
    
    // 初始化四边形
    for (let i = 0; i < config.numQuadrilaterals; i++) {
        quadrilaterals.push(createQuadrilateral());
    }
    
    // 平滑地在两个点之间插值
    function interpolatePoint(p1, p2, t) {
        // 使用缓动函数使过渡更自然
        const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        return {
            x: p1.x + (p2.x - p1.x) * easeT,
            y: p1.y + (p2.y - p1.y) * easeT
        };
    }
    
    // 绘制四边形
    function drawQuadrilateral(quad) {
        if (quad.alpha <= 0) return;
        
        // 创建渐变颜色，使四边形中心到边缘有渐变效果
        const gradient = ctx.createLinearGradient(
            quad.currentPoints[0].x, quad.currentPoints[0].y,
            quad.currentPoints[2].x, quad.currentPoints[2].y
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${quad.alpha * 0.1})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${quad.alpha * 0.3})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${quad.alpha * 0.1})`);
        
        // 创建发光效果
        ctx.save();
        ctx.filter = `blur(${config.glowRadius}px)`;
        ctx.beginPath();
        ctx.moveTo(quad.currentPoints[0].x, quad.currentPoints[0].y);
        for (let i = 1; i < 4; i++) {
            ctx.lineTo(quad.currentPoints[i].x, quad.currentPoints[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = quad.glowColor;
        ctx.globalAlpha = quad.alpha * 0.3;
        ctx.fill();
        ctx.restore();
        
        // 绘制四边形轮廓
        ctx.beginPath();
        ctx.moveTo(quad.currentPoints[0].x, quad.currentPoints[0].y);
        for (let i = 1; i < 4; i++) {
            // 为了科技感，可以让线段稍微平滑一些
            ctx.lineTo(quad.currentPoints[i].x, quad.currentPoints[i].y);
        }
        ctx.closePath();
        
        // 填充
        ctx.fillStyle = gradient;
        ctx.globalAlpha = quad.alpha * 0.2;
        ctx.fill();
        
        // 描边
        ctx.strokeStyle = config.strokeColor;
        ctx.lineWidth = config.strokeWidth;
        ctx.globalAlpha = quad.alpha;
        ctx.stroke();
        
        // 绘制连接线
        ctx.beginPath();
        ctx.moveTo(quad.currentPoints[0].x, quad.currentPoints[0].y);
        ctx.lineTo(quad.currentPoints[1].x, quad.currentPoints[1].y);
        ctx.lineTo(quad.currentPoints[2].x, quad.currentPoints[2].y);
        ctx.lineTo(quad.currentPoints[3].x, quad.currentPoints[3].y);
        ctx.strokeStyle = quad.color;
        ctx.lineWidth = config.strokeWidth * 0.6;
        ctx.globalAlpha = quad.alpha * 0.6;
        ctx.stroke();
        
        // 重置globalAlpha
        ctx.globalAlpha = 1;
    }
    
    // 更新四边形
    function updateQuadrilaterals() {
        const now = Date.now();
        
        quadrilaterals.forEach((quad, index) => {
            // 更新生命周期
            quad.lifetime += 16; // 假设约16ms一帧
            
            // 处理淡入
            if (quad.fadeIn && quad.alpha < 1) {
                quad.alpha += config.fadeInSpeed;
                if (quad.alpha >= 1) {
                    quad.alpha = 1;
                    quad.fadeIn = false;
                }
            }
            
            // 定期淡出并重新生成四边形
            if (quad.lifetime > 15000 + Math.random() * 10000) { // 15-25秒的生命周期
                quad.fadeOut = true;
            }
            
            // 处理淡出
            if (quad.fadeOut && quad.alpha > 0) {
                quad.alpha -= config.fadeOutSpeed;
                if (quad.alpha <= 0) {
                    // 重新生成四边形
                    quadrilaterals[index] = createQuadrilateral();
                    return;
                }
            }
            
            // 计算过渡进度
            if (quad.transitionProgress >= 1) {
                // 准备新的过渡
                quad.lastTransitionTime = now;
                quad.transitionProgress = 0;
                quad.currentPoints = [...quad.targetPoints]; // 复制当前目标点
                
                // 如果有下一个目标点，使用它；否则生成新的
                if (quad.nextTargetPoints) {
                    quad.targetPoints = quad.nextTargetPoints;
                    quad.nextTargetPoints = null;
                } else {
                    quad.targetPoints = generateQuadrilateralPoints(quad.centerX, quad.centerY, 
                        config.minSize + Math.random() * (config.maxSize - config.minSize));
                }
            } else {
                // 计算当前过渡进度
                quad.transitionProgress = Math.min(
                    1, 
                    (now - quad.lastTransitionTime) / config.transitionDuration
                );
                
                // 在当前点和目标点之间插值
                for (let i = 0; i < 4; i++) {
                    quad.currentPoints[i] = interpolatePoint(
                        quad.currentPoints[i], 
                        quad.targetPoints[i], 
                        quad.transitionProgress
                    );
                }
            }
            
            // 轻微移动中心点，增加动感
            quad.centerX += Math.sin(Date.now() * 0.0005 * Math.abs(quad.speed)) * 0.2;
            quad.centerY += Math.cos(Date.now() * 0.0005 * Math.abs(quad.speed)) * 0.2;
            
            // 确保四边形不会完全移出画布
            for (let i = 0; i < 4; i++) {
                if (quad.currentPoints[i].x < -config.maxSize || 
                    quad.currentPoints[i].x > canvas.width + config.maxSize ||
                    quad.currentPoints[i].y < -config.maxSize || 
                    quad.currentPoints[i].y > canvas.height + config.maxSize) {
                    // 为超出边界的四边形准备新的位置
                    if (!quad.nextTargetPoints) {
                        // 生成在画布内的新位置
                        const newCenterX = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
                        const newCenterY = Math.random() * canvas.height * 0.8 + canvas.height * 0.1;
                        quad.nextTargetPoints = generateQuadrilateralPoints(newCenterX, newCenterY, 
                            config.minSize + Math.random() * (config.maxSize - config.minSize));
                    }
                }
            }
        });
    }
    
    // 绘制网格背景效果
    function drawGridBackground() {
        const gridSize = 50;
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        
        // 绘制垂直线
        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // 绘制水平线
        for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    // 动画循环
    function animate() {
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制网格背景
        drawGridBackground();
        
        // 更新四边形
        updateQuadrilaterals();
        
        // 绘制四边形
        quadrilaterals.forEach(drawQuadrilateral);
        
        // 请求下一帧
        requestAnimationFrame(animate);
    }
    
    // 开始动画
    animate();
    
    // 返回控制对象，允许外部控制
    return {
        // 添加新四边形
        addQuadrilateral: function() {
            quadrilaterals.push(createQuadrilateral());
        },
        
        // 更新配置
        updateConfig: function(newConfig) {
            Object.assign(config, newConfig);
        },
        
        // 重置画布大小
        resetSize: resizeCanvas,
        
        // 清除所有四边形
        clear: function() {
            quadrilaterals.length = 0;
        },
        
        // 设置四边形数量
        setCount: function(count) {
            if (count > quadrilaterals.length) {
                // 添加更多四边形
                for (let i = quadrilaterals.length; i < count; i++) {
                    quadrilaterals.push(createQuadrilateral());
                }
            } else if (count < quadrilaterals.length) {
                // 移除多余的四边形
                quadrilaterals.splice(count);
            }
        }
    };
}

// 自动初始化（如果页面加载完成且存在适当的元素）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (document.getElementById('polygonCanvas')) {
            initPolygonBackground();
        }
    });
} else if (document.getElementById('polygonCanvas')) {
    initPolygonBackground();
}