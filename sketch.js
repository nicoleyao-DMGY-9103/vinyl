let playerImg;
let angle = 0;
let vinylImages = []; // 存储多张唱片图片
let currentVinylIndex = 0; // 当前显示的唱片索引
let vinylScale = 0.4; // 缩放比例变量
let buttons = []; // 按钮数组

function preload() {
  // 预加载图片
  playerImg = loadImage('唱片指针.png');
  // 加载多张唱片图片
  vinylImages.push(loadImage('v1.png'));
  vinylImages.push(loadImage('v2.png'));
  vinylImages.push(loadImage('v3.png'));
}

function setup() {
  // 创建全屏画布
  createCanvas(windowWidth, windowHeight);
  // 图片居中显示
  imageMode(CENTER);
  
  // 创建按钮
  const buttonWidth = 80;
  const buttonHeight = 40;
  const buttonSpacing = 20;
  const buttonColors = ["#FF5252", "#4CAF50", "#2196F3"]; // 红、绿、蓝按钮颜色
  const buttonNames = ["红色唱片", "绿色唱片", "蓝色唱片"];
  
  // 计算按钮起始位置，使按钮在屏幕底部居中
  let startX = (width - (buttonWidth * 3 + buttonSpacing * 2)) / 2;
  
  for (let i = 0; i < 3; i++) {
    buttons.push({
      x: startX + i * (buttonWidth + buttonSpacing),
      y: height - 80,
      width: buttonWidth,
      height: buttonHeight,
      color: buttonColors[i],
      name: buttonNames[i],
      index: i
    });
  }
}

function draw() {
  // 设置深蓝色背景 (21, 34, 56)
  background(21, 34, 56);
  
  // 旋转黑胶唱片
  push();
  translate(width/2, height/2);
  rotate(angle);
  scale(vinylScale);
  image(vinylImages[currentVinylIndex], 0, 0);
  pop();
  
  // 持续增加角度
  angle += 0.01;

  // 绘制唱片指针
  image(playerImg, width/2, height/2);
  
  // 绘制按钮
  drawButtons();
}

// 绘制所有按钮
function drawButtons() {
  for (let button of buttons) {
    // 绘制按钮背景
    fill(button.color);
    stroke(255);
    strokeWeight(2);
    rect(button.x, button.y, button.width, button.height, 10);
    
    // 绘制按钮文字
    fill(255);
    noStroke();
    textSize(14);
    textAlign(CENTER, CENTER);
    text(button.name, button.x + button.width / 2, button.y + button.height / 2);
  }
}

// 处理鼠标点击事件
function mousePressed() {
  // 检查是否点击了任何按钮
  for (let button of buttons) {
    if (mouseX > button.x && mouseX < button.x + button.width &&
        mouseY > button.y && mouseY < button.y + button.height) {
      currentVinylIndex = button.index;
      return;
    }
  }
}

// 当窗口大小改变时，调整画布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // 更新按钮位置
  const buttonWidth = 80;
  const buttonHeight = 40;
  const buttonSpacing = 20;
  let startX = (width - (buttonWidth * 3 + buttonSpacing * 2)) / 2;
  
  for (let i = 0; i < 3; i++) {
    buttons[i].x = startX + i * (buttonWidth + buttonSpacing);
    buttons[i].y = height - 80;
  }
}