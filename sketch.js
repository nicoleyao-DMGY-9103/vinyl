let playerImg;
let angle = 0;
let vinylImages = []; // Store multiple vinyl record images
let currentVinylIndex = 0; // Current displayed vinyl index
let vinylScale = 0.25; // Scale variable
let tonearmScale = 0.62
let buttons = []; // Button array
let buttonPressed = -1; // Track currently pressed button index
let leftHalfWidth; // Left half width
let coverImg; // Added cover image variable

// 歌词相关变量
let lyrics = [];
let currentLyricIndex = 0;
let lyricChangeInterval = 3000; // 每3秒切换一句歌词
let lastLyricChangeTime = 0;
let lyricFont;
let lyricFadeIn = 0; // 用于淡入效果

// 模式相关变量
let currentMode = "show"; // "show" 或 "record"
let modeButtons = []; // 模式切换按钮数组
let modeButtonPressed = -1; // 跟踪当前按下的模式按钮索引

// 录音相关变量
let recorder;
let soundFile;
let isRecording = false;
let recordButton;
let transcribeButton;
let saveButton;
let recordingStatus = "Click to start recording";
let transcriptionResult = "";
let isTranscribing = false;
// 用于模拟打字效果的变量
let simulationMode = true;
let simulationStartTime = 0;
let displayText = "";
let fullText = "";
let charIndex = 0;
let charSpeed = 50; // 每个字符显示的毫秒数
// 计时器相关变量
let recordingStartTime = 0;
let recordingDuration = 0;
const MAX_RECORDING_TIME = 180000; // 最大录音时间3分钟（毫秒）

function preload() {
  // Preload images
  playerImg = loadImage('tonearm.png');
  coverImg = loadImage('cover.png'); // Load the cover image

  // Load multiple vinyl images
  vinylImages.push(loadImage('v1.png'));
  vinylImages.push(loadImage('v2.png'));
  vinylImages.push(loadImage('v3.png'));
  vinylImages.push(loadImage('v4.png'));

  // 加载歌词文件
  loadStrings('text.txt', function(result) {
    lyrics = result;
  });
  
  // 加载字体（可选）
  // lyricFont = loadFont('yourfont.ttf');
}

function setup() {
  // Create fullscreen canvas
  createCanvas(windowWidth, windowHeight);
  // Center image display
  imageMode(CENTER);
  
  // Calculate left half width
  leftHalfWidth = width / 2;
  
  // Create buttons
  const buttonWidth = 80;
  const buttonHeight = 40;
  const buttonSpacing = 20;
  const buttonColors = ["#FF5252", "#4CAF50", "#2196F3", "#FF9800"]; // Red, Green, Blue button colors
  const buttonNames = ["love", "travel", "adventure", "life lesson"];
  
  // 计算按钮起始位置，顶部居中
  let startX = (width - (buttonWidth * 4 + buttonSpacing * 3)) / 2;
  let topMargin = 40; // 顶部边距
  
  for (let i = 0; i < 4; i++) {
    buttons.push({
      x: startX + i * (buttonWidth + buttonSpacing),
      y: topMargin,
      width: buttonWidth,
      height: buttonHeight,
      color: buttonColors[i],
      name: buttonNames[i],
      index: i
    });
  }
  
  // 创建模式切换按钮
  const modeButtonWidth = 100;
  const modeButtonHeight = 40;
  const modeButtonSpacing = 20;
  const modeButtonColors = ["#9C27B0", "#FF9800"]; // 紫色和橙色
  const modeButtonNames = ["Display", "Record"];
  const modeButtonValues = ["show", "record"];
  const leftMargin = 20; // 左侧边距
  
  for (let i = 0; i < 2; i++) {
    modeButtons.push({
      x: leftMargin,
      y: leftMargin + i * (modeButtonHeight + modeButtonSpacing),
      width: modeButtonWidth,
      height: modeButtonHeight,
      color: modeButtonColors[i],
      name: modeButtonNames[i],
      value: modeButtonValues[i],
      index: i
    });
  }
  
  // 初始化歌词时间
  lastLyricChangeTime = millis();
  
  // 初始化录音功能
  if (window.p5 && window.p5.SoundRecorder) {
    recorder = new p5.SoundRecorder();
    soundFile = new p5.SoundFile();
  } else {
    console.warn('p5.sound library not loaded, please add p5.sound.js to index.html');
    // 启用模拟模式，以便即使没有sound库也能演示效果
    simulationMode = true;
  }
  
  // 创建录制页面的按钮 - 向上移动200像素
  recordButton = createButton('Start Recording');
  recordButton.position(width*3/4 - 180, height/2 - 250); // 从height/2 - 50改为height/2 - 250
  recordButton.size(150, 50);
  recordButton.mousePressed(toggleRecording);
  recordButton.hide(); // 默认隐藏，只在录制模式显示
  
  transcribeButton = createButton('Transcribe Audio');
  transcribeButton.position(width*3/4 - 180, height/2 - 180); // 从height/2 + 20改为height/2 - 180
  transcribeButton.size(150, 50);
  transcribeButton.mousePressed(transcribeAudio);
  transcribeButton.attribute('disabled', '');
  transcribeButton.hide(); // 默认隐藏，只在录制模式显示
  
  saveButton = createButton('Save Lyrics');
  saveButton.position(width*3/4 + 10, height/2 - 180); // 从height/2 + 90改为height/2 - 110
  saveButton.size(150, 50);
  saveButton.mousePressed(saveLyrics);
  saveButton.attribute('disabled', '');
  saveButton.hide(); // 默认隐藏，只在录制模式显示
  
  // 设置为默认启用模拟模式
  simulationMode = true;
}

function draw() {
  // Set deep blue background (21, 34, 56)
  background(21, 34, 56);
  
  if (currentMode === "show") {
    drawShowMode();
    // 隐藏录制模式的按钮
    recordButton.hide();
    transcribeButton.hide();
    saveButton.hide();
  } else if (currentMode === "record") {
    drawRecordMode();
    // 显示录制模式的按钮
    recordButton.show();
    transcribeButton.show();
    saveButton.show();
  }
  
  // 绘制模式切换按钮
  drawModeButtons();
}

// 展示模式的绘制
function drawShowMode() {
  // Rotate vinyl record
  if (vinylImages[currentVinylIndex]) {
    push();
    translate(width/2, height/2); // Adjust vinyl position to center
    rotate(angle);
    scale(vinylScale);
    image(vinylImages[currentVinylIndex], 0, 0);
    pop();
  }
  
  // Continuously increase angle
  angle += 0.01;

  // Draw tonearm
  if (playerImg) {
    push();
    scale(tonearmScale);
    image(playerImg, width/(tonearmScale*2), height/(tonearmScale*2));
    pop();
  }
  
  // Draw buttons
  drawButtons();
  
  // 显示歌词
  displayLyrics();
}

// 录制模式的绘制
function drawRecordMode() {
  // 划分左右两半部分
  stroke(100);
  strokeWeight(1);
  line(width/2, 0, width/2, height);
  
  // 在左半部分显示封面图片
  if (coverImg) {
    // 计算图片应该显示的尺寸，适应左半屏幕
    let imgRatio = coverImg.width / coverImg.height;
    let displayHeight = height * 0.8; // 使用80%的高度
    let displayWidth = displayHeight * imgRatio;
    
    // 如果宽度超过左半部分，重新计算
    if (displayWidth > width/2 * 0.9) {
      displayWidth = width/2 * 0.9;
      displayHeight = displayWidth / imgRatio;
    }
    
    // 在左半部分居中显示图片
    imageMode(CENTER);
    image(coverImg, width/4, height/2, displayWidth, displayHeight);
  }
  
  // 右半部分显示录音控制界面
  
  // 更新录音时长（如果正在录音）
  if (isRecording) {
    recordingDuration = millis() - recordingStartTime;
    
    // 如果录音时长超过3分钟，自动停止录音
    if (recordingDuration >= MAX_RECORDING_TIME) {
      toggleRecording(); // 停止录音
      alert("Maximum recording time of 3 minutes reached.");
    }
  }
  
  // 绘制标题
  textAlign(CENTER, TOP);
  textSize(28);
  fill(255);
  text("Let's create your own story!", width*3/4, 80);
  
  // 绘制录音状态
  textSize(18);
  fill(isRecording ? "#FF5252" : "#FFFFFF");
  text(recordingStatus, width*3/4, height/2 - 290);
  
  // 绘制录音计时器
  if (isRecording || recordingDuration > 0) {
    // 计算分钟和秒钟
    let seconds = Math.floor(recordingDuration / 1000);
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    
    // 格式化显示时间
    let timeText = nf(minutes, 2) + ":" + nf(seconds, 2);
    
    // 绘制计时器背景
    fill(isRecording ? "#FF5252" : "#4CAF50");
    rect(width*3/4 + 50, height/2 - 240, 80, 30, 5);
    
    // 绘制计时器文本
    fill(255);
    textSize(16);
    textAlign(CENTER, CENTER);
    text(timeText, width*3/4 + 90, height/2 - 225);
    
  }
  
  // 绘制录音动画（如果正在录音）
  if (isRecording) {
    fill("#FF5252");
    ellipse(width*3/4 - 80, height/2 - 280, 20 + 10 * sin(frameCount * 0.1), 20 + 10 * sin(frameCount * 0.1));
  }
  
  // 如果正在转写，显示加载动画
  if (isTranscribing) {
    textSize(18);
    fill("#4CAF50");
    text("Transcribing...", width*3/4, height/2 + 160);
    
    // 简单的加载动画
    push();
    translate(width*3/4, height/2 + 190);
    rotate(frameCount * 0.1);
    noFill();
    stroke("#4CAF50");
    strokeWeight(3);
    arc(0, 0, 40, 40, 0, PI + HALF_PI);
    pop();
  }
  
  // 处理逐字显示效果 - 即使在转写过程中也开始显示
  if (simulationMode && fullText) {
    let currentTime = millis();
    let elapsedTime = currentTime - simulationStartTime;
    let targetCharCount = Math.floor(elapsedTime / charSpeed);
    
    // 如果还有更多字符要显示
    if (charIndex < fullText.length && targetCharCount > charIndex) {
      // 更新当前要显示的字符索引
      charIndex = min(targetCharCount, fullText.length);
      // 更新显示的文本
      displayText = fullText.substring(0, charIndex);
      // 更新转写结果
      transcriptionResult = displayText;
    }
  }
  
  // 绘制转写结果框
  fill(40, 53, 74);
  const resultBoxX = width*3/4 - 200;
  const resultBoxY = height/2 - 100;
  const resultBoxWidth = 400;
  const resultBoxHeight = 400;
  rect(resultBoxX, resultBoxY, resultBoxWidth, resultBoxHeight, 10);
  
  // 显示转写结果 - 实现自动换行
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP); // 改为左对齐和顶部对齐
  
  // 设置文本区域的边距
  const textMargin = 20;
  const textAreaX = resultBoxX + textMargin;
  const textAreaY = resultBoxY + textMargin;
  const textAreaWidth = resultBoxWidth - (textMargin * 2);
  const textAreaHeight = resultBoxHeight - (textMargin * 2);
  
  // 如果有转写结果，则显示结果；否则显示提示文本
  const textToDisplay = transcriptionResult || "Transcription result will appear here";
  
  // 实现文本换行
  let words = textToDisplay.split(' ');
  let currentLine = '';
  let y = textAreaY;
  let lineHeight = 24;
  
  // 逐词检查并添加到当前行
  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    let testLine = currentLine === '' ? word : currentLine + ' ' + word;
    let testWidth = textWidth(testLine);
    
    // 如果添加这个词会超出宽度，则绘制当前行并开始新行
    if (testWidth > textAreaWidth) {
      text(currentLine, textAreaX, y);
      y += lineHeight;
      currentLine = word;
      
      // 如果超出高度，则停止绘制
      if (y > textAreaY + textAreaHeight - lineHeight) {
        text('...', textAreaX, y);
        break;
      }
    } else {
      currentLine = testLine;
    }
  }
  
  // 绘制最后一行
  if (currentLine !== '' && y <= textAreaY + textAreaHeight - lineHeight) {
    text(currentLine, textAreaX, y);
  }
  
  // 调试信息显示
  fill(150);
  textSize(10);
  textAlign(LEFT);
  text("SimMode: " + simulationMode, resultBoxX + 10, resultBoxY + resultBoxHeight + 10);
  text("FullText: " + (fullText ? fullText.substring(0, 20) + "..." : "none"), resultBoxX + 10, resultBoxY + resultBoxHeight + 25);
  text("CharIndex: " + charIndex + "/" + (fullText ? fullText.length : 0), resultBoxX + 10, resultBoxY + resultBoxHeight + 40);
}

// 绘制模式切换按钮
function drawModeButtons() {
  for (let i = 0; i < modeButtons.length; i++) {
    const button = modeButtons[i];
    
    // 高亮当前模式按钮
    if (button.value === currentMode) {
      fill(lerpColor(color(button.color), color(255), 0.3));
      stroke(255);
      strokeWeight(3);
    } else if (i === modeButtonPressed) {
      // 如果按钮被按下，使用更深的颜色
      fill(lerpColor(color(button.color), color(0), 0.3));
      stroke(255);
      strokeWeight(2);
    } else {
      fill(button.color);
      stroke(255);
      strokeWeight(1);
    }
    
    rect(button.x, button.y, button.width, button.height, 10);
    
    // 绘制按钮文本
    fill(255);
    noStroke();
    textSize(16);
    textAlign(CENTER, CENTER);
    text(button.name, button.x + button.width / 2, button.y + button.height / 2);
  }
}

// 切换录音状态
function toggleRecording() {
  if (!recorder || !soundFile) {
    alert('Recording function requires p5.sound library, please add p5.sound.js to index.html');
    return;
  }
  
  if (isRecording) {
    // 停止录音
    recorder.stop();
    recordingStatus = "Recording completed";
    recordButton.html('Start Recording');
    transcribeButton.removeAttribute('disabled');
    isRecording = false;
    // 停止计时
    recordingDuration = millis() - recordingStartTime;
  } else {
    // 开始录音
    recordingStatus = "Recording...";
    recordButton.html('Stop Recording');
    transcribeButton.attribute('disabled', '');
    saveButton.attribute('disabled', '');
    transcriptionResult = "";
    
    // 创建新的p5.SoundFile用于录音
    soundFile = new p5.SoundFile();
    
    // 录制到soundFile
    recorder.record(soundFile);
    isRecording = true;
    
    // 开始计时
    recordingStartTime = millis();
    recordingDuration = 0;
  }
}

// 转写音频函数
function transcribeAudio() {
  if (!soundFile || !soundFile.duration) {
    if (!simulationMode) {
      alert('No recording available');
      return;
    }
  }
  
  recordingStatus = "Transcribing...";
  isTranscribing = true;
  transcribeButton.attribute('disabled', '');
  
  // 始终使用模拟模式进行演示
  simulationMode = true;
  
  // 使用text.txt中的歌词来模拟转写结果
  fullText = lyrics.join(" ");
  charIndex = 0;
  displayText = "";
  simulationStartTime = millis();
  
  // 模拟转写过程的延迟
  setTimeout(function() {
    isTranscribing = false;
    recordingStatus = "Transcription completed";
    saveButton.removeAttribute('disabled');
    transcribeButton.removeAttribute('disabled');
  }, 3000);
  
  // 如果不是模拟模式且有录音，则继续原来的API调用逻辑
  if (!simulationMode && soundFile && soundFile.duration) {
    // 将录音保存为blob对象
    soundFile.getBlob(function(blob) {
      // 创建一个FormData对象
      let formData = new FormData();
      formData.append('audio', blob, 'recording.wav');
      
      // 发送到服务器
      fetch('http://localhost:3000/api/transcribe', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        isTranscribing = false;
        
        if (data.success) {
          // 设置转写结果，准备显示
          fullText = data.text;
          charIndex = 0;
          displayText = "";
          simulationStartTime = millis();
          simulationMode = true; // 启用逐字显示模式
          
          recordingStatus = "Transcription completed";
          saveButton.removeAttribute('disabled');
        } else {
          transcriptionResult = "Transcription failed: " + (data.error || "Unknown error");
          recordingStatus = "Transcription failed";
        }
        transcribeButton.removeAttribute('disabled');
      })
      .catch(error => {
        console.error('Error:', error);
        transcriptionResult = "Transcription failed: " + error.message;
        recordingStatus = "Transcription failed";
        transcribeButton.removeAttribute('disabled');
        isTranscribing = false;
      });
    });
  }
}

// 保存歌词到text.txt
function saveLyrics() {
  if (!transcriptionResult) {
    alert('No lyrics to save');
    return;
  }
  
  // 由于无法在前端直接写入文件，我们需要通过API请求保存
  // 在实际应用中，你需要创建一个后端API来处理这个请求
  alert('The lyrics save function requires backend support. In a real application, this would save the transcription result to the text.txt file.\n\nTranscription result:\n' + transcriptionResult);
  
  // 如果有后端API，可以使用下面的代码发送请求
  /*
  fetch('http://localhost:3000/api/save-lyrics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: transcriptionResult })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Lyrics saved successfully');
    } else {
      alert('Failed to save lyrics: ' + (data.error || "Unknown error"));
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Failed to save lyrics: ' + error.message);
  });
  */
}

// 显示歌词的函数
function displayLyrics() {
  if (lyrics.length === 0) return;
  
  // 检查是否应该切换到下一句歌词
  let currentTime = millis();
  if (currentTime - lastLyricChangeTime > lyricChangeInterval) {
    currentLyricIndex = (currentLyricIndex + 1) % lyrics.length;
    lastLyricChangeTime = currentTime;
    lyricFadeIn = 0; // 重置淡入效果
  }
  
  // 计算淡入效果
  if (lyricFadeIn < 255) {
    lyricFadeIn += 5;
  }
  
  // 绘制当前歌词
  if (lyrics[currentLyricIndex]) {
    textAlign(CENTER, CENTER);
    // 如果有加载字体，可以使用: textFont(lyricFont);
    textSize(28);
    
    // 设置歌词位置在屏幕底部
    let bottomMargin = height - 70; // 距离底部70像素
    
    // 添加文字阴影效果
    fill(0, 0, 0, lyricFadeIn * 0.7);
    text(lyrics[currentLyricIndex], width/2 + 2, bottomMargin + 2);
    
    // 绘制主文本
    fill(255, 255, 255, lyricFadeIn);
    text(lyrics[currentLyricIndex], width/2, bottomMargin);
  }
}

// Draw all buttons
function drawButtons() {
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    
    // If button is pressed, use darker color
    if (i === buttonPressed) {
      fill(lerpColor(color(button.color), color(0), 0.3));
    } else {
      fill(button.color);
    }
    
    stroke(255);
    strokeWeight(2);
    rect(button.x, button.y, button.width, button.height, 10);
    
    // Draw button text
    fill(255);
    noStroke();
    textSize(14);
    textAlign(CENTER, CENTER);
    text(button.name, button.x + button.width / 2, button.y + button.height / 2);
  }
}

// Handle mouse click events
function mousePressed() {
  // 检查是否点击了模式按钮
  for (let i = 0; i < modeButtons.length; i++) {
    const button = modeButtons[i];
    if (mouseX > button.x && mouseX < button.x + button.width &&
        mouseY > button.y && mouseY < button.y + button.height) {
      currentMode = button.value;
      modeButtonPressed = i;
      return;
    }
  }
  
  // 如果在展示模式下，检查是否点击了其他按钮
  if (currentMode === "show") {
    // Check if any button was clicked
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      if (mouseX > button.x && mouseX < button.x + button.width &&
          mouseY > button.y && mouseY < button.y + button.height) {
        currentVinylIndex = button.index;
        buttonPressed = i;
        return;
      }
    }
  }
}

// Handle mouse release events
function mouseReleased() {
  buttonPressed = -1;
  modeButtonPressed = -1;
}

// When window size changes, adjust canvas size
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // Update left half width
  leftHalfWidth = width / 2;
  
  // Update button positions
  const buttonWidth = 80;
  const buttonHeight = 40;
  const buttonSpacing = 20;
  let startX = (width - (buttonWidth * 3 + buttonSpacing * 2)) / 2;
  let topMargin = 40; // 顶部边距
  
  for (let i = 0; i < 3; i++) {
    buttons[i].x = startX + i * (buttonWidth + buttonSpacing);
    buttons[i].y = topMargin;
  }
  
  // 更新录制页面按钮位置 - 向上移动200像素
  recordButton.position(width*3/4 - 200, height/2 - 250);
  transcribeButton.position(width*3/4 - 200, height/2 - 180);
  saveButton.position(width*3/4 - 20, height/2 - 180);
}