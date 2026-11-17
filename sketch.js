// 宣告變數以儲存待機與走路兩張圖片精靈圖。
let stopSheet; // 記錄角色待機精靈圖。
let walkSheet; // 記錄角色走路精靈圖。
let magicSheet; // 記錄角色施展魔法的精靈圖。
// 宣告陣列以分別存放待機和走路動畫影格。
let stopFrames = []; // 依序存放八張待機影格。
let walkFrames = []; // 依序存放八張走路影格。
let magicFrames = []; // 依序存放五張魔法影格。
let magicEffectFrames = []; // 存放保留原始光效並去除人物的特效影格。
// 設定兩張精靈圖的影格數量與總寬度。
const totalFrames = 8; // 待機與走路動畫各有八張影格。
const sheetWidth = 1107; // 每張精靈圖的總寬度為 1107 像素。
const magicSheetWidth = 1300; // 魔法精靈圖的總寬度為 1300 像素。
const magicSheetHeight = 148; // 魔法精靈圖的高度為 148 像素。
const magicFrameCount = 5; // 魔法精靈圖包含五張水平排列的影格。
const magicFrameWidth = magicSheetWidth / magicFrameCount; // 每張魔法影格寬度為 260 像素。
const magicEffectFrameCount = 3; // 飛行特效使用含有光束的三張影格。
// 設定兩張精靈圖的高度。
const stopSheetHeight = 196; // 待機精靈圖高度為 196 像素。
const walkSheetHeight = 197; // 走路精靈圖高度為 197 像素。
// 計算每張影格的寬度。
const frameWidth = sheetWidth / totalFrames; // 將精靈圖平均分為八格。
// 記錄目前動畫影格、角色位置和行走狀態。
let currentFrame = 0; // 動畫從第一張影格開始播放。
let characterX; // 儲存角色目前的水平中心位置。
let moveDirection = 0; // 0 表示停止移動，1 表示右移，-1 表示左移。
let facingDirection = 1; // 1 表示面向右方，-1 表示面向左方。
let isWalking = false; // 記錄角色是否已切換為走路動畫。
let leftKeyDown = false; // 記錄左方向鍵目前是否按住。
let rightKeyDown = false; // 記錄右方向鍵目前是否按住。
let lastPressedDirection = 1; // 記錄最後按下的方向鍵，以處理同時按鍵。
let spaceKeyDown = false; // 記錄空白鍵目前是否按住，避免長按重複觸發。
let isCastingMagic = false; // 記錄一次性的魔法動畫是否正在播放。
let magicFrame = 0; // 記錄目前播放的魔法動畫影格。
let effectActive = false; // 記錄魔法特效是否正在畫面中移動。
let effectX = 0; // 記錄魔法特效目前的水平中心位置。
let effectDirection = 1; // 記錄魔法特效移動方向。
let effectFrame = 0; // 記錄目前播放的飛行光效影格。
// 設定影格切換和角色移動速度。
const animSpeed = 8; // 每隔八個繪圖循環切換一次影格。

// 在建立畫布前載入待機、走路與魔法精靈圖。
function preload() { 
  stopSheet = loadImage('1/stop/1stop.png'); // 載入角色待機精靈圖。
  walkSheet = loadImage('1/walk/1walk.png'); // 載入角色走路精靈圖。
  magicSheet = loadImage('1/magic/1magic.png'); // 載入角色魔法精靈圖。
}

// 初始化全螢幕畫布與動畫影格。
function setup() { 
  createCanvas(windowWidth, windowHeight); // 建立填滿瀏覽器視窗的畫布。
  imageMode(CENTER); // 以影格中心點作為圖片繪製座標。
  characterX = width * (2 / 3); // 將角色初始位置設在畫布寬度的三分之二處。
  for (let i = 0; i < totalFrames; i++) { 
    const sourceX = i * frameWidth; // 計算目前影格在精靈圖中的水平位置。
    stopFrames.push(stopSheet.get(sourceX, 0, frameWidth, stopSheetHeight)); // 裁切並儲存一張待機影格。
    walkFrames.push(walkSheet.get(sourceX, 0, frameWidth, walkSheetHeight)); // 裁切並儲存一張走路影格。
  }
  for (let i = 0; i < magicFrameCount; i++) { 
    const sourceX = i * magicFrameWidth; // 計算目前魔法影格在精靈圖中的水平位置。
    magicFrames.push(magicSheet.get(sourceX, 0, magicFrameWidth, magicSheetHeight)); // 裁切並儲存一張魔法影格。
  }
  magicEffectFrames.push(createMagicEffectFrame(1, 220)); // 擷取第二格光束並排除手臂附近的白色像素。
  magicEffectFrames.push(createMagicEffectFrame(2, 220)); // 擷取第三格光束並排除手臂附近的白色像素。
  magicEffectFrames.push(createMagicEffectFrame(3, 220)); // 擷取第四格光束並排除手臂附近的白色像素。
}

// 保留原始魔法光束的亮色像素並透明化人物像素。
function createMagicEffectFrame(frameIndex, whiteGlowStartX) { 
  const effectFrameImage = magicSheet.get(frameIndex * magicFrameWidth, 0, magicFrameWidth, magicSheetHeight); // 複製完整魔法影格。
  effectFrameImage.loadPixels(); // 載入影格像素以篩選魔法光束顏色。
  for (let y = 0; y < effectFrameImage.height; y++) { 
    for (let x = 0; x < effectFrameImage.width; x++) { 
      const pixelIndex = (y * effectFrameImage.width + x) * 4; 
      const red = effectFrameImage.pixels[pixelIndex]; 
      const green = effectFrameImage.pixels[pixelIndex + 1]; 
      const blue = effectFrameImage.pixels[pixelIndex + 2]; 
      const alpha = effectFrameImage.pixels[pixelIndex + 3]; 
      const blueGlow = blue > 150 && green > 115 && blue > red * 1.1; 
      const warmGlow = red > 220 && green > 100 && red - green > 70 && green - blue > 45; 
      const whiteGlow = x >= whiteGlowStartX && red > 225 && green > 225 && blue > 205; 
      if (alpha === 0 || !(blueGlow || warmGlow || whiteGlow)) { 
        effectFrameImage.pixels[pixelIndex + 3] = 0; 
      } 
    } 
  } 
  effectFrameImage.updatePixels(); 
  return effectFrameImage; 
}

// 按下空白鍵或方向鍵時更新角色動作。
function keyPressed() { 
  if (keyCode === 32) { 
    if (!spaceKeyDown && !isCastingMagic) { 
      spaceKeyDown = true; 
      magicFrame = 0; 
      isCastingMagic = true; 
      moveDirection = 0; 
    } else { 
      spaceKeyDown = true; 
    } 
    return false; 
  } 
  if (keyCode === RIGHT_ARROW) { 
    rightKeyDown = true; 
    lastPressedDirection = 1; 
    updateMovementState(); 
    return false; 
  } 
  if (keyCode === LEFT_ARROW) { 
    leftKeyDown = true; 
    lastPressedDirection = -1; 
    updateMovementState(); 
    return false; 
  } 
}

// 放開左右方向鍵時依剩餘按鍵切換走路或待機動畫。
function keyReleased() { 
  if (keyCode === 32) { 
    spaceKeyDown = false; 
    return false; 
  } 
  if (keyCode === RIGHT_ARROW) rightKeyDown = false; 
  if (keyCode === LEFT_ARROW) leftKeyDown = false; 
  if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) { 
    updateMovementState(); 
    return false; 
  } 
}

// 根據目前按住的方向鍵設定角色移動方向和動畫狀態。
function updateMovementState() { 
  let nextDirection = 0; 
  if (leftKeyDown && rightKeyDown) nextDirection = lastPressedDirection; 
  else if (rightKeyDown) nextDirection = 1; 
  else if (leftKeyDown) nextDirection = -1; 
  if (nextDirection === 0) { 
    if (isWalking) currentFrame = 0; 
    isWalking = false; 
    moveDirection = 0; 
    return; 
  } 
  if (!isWalking) currentFrame = 0; 
  isWalking = true; 
  moveDirection = nextDirection; 
  facingDirection = nextDirection; 
}

// 在施法動畫結束時建立一個朝角色面向方向移動的特效。
function startMagicEffect() { 
  effectDirection = facingDirection; 
  effectX = characterX; 
  effectFrame = 0; 
  effectActive = true; 
}

// 持續繪製天空背景與目前動畫影格。
function draw() { 
  background(135, 206, 235); // 使用天空藍色 RGB 值繪製背景。
  
  // 將角色高度設定為畫布總高度的 1/3，並根據圖片原始比例計算對應寬度
  const displayHeight = height / 3; 
  const frameHeight = isWalking ? walkSheetHeight : stopSheetHeight; 
  const characterDisplayHeight = isCastingMagic ? displayHeight * (magicSheetHeight / stopSheetHeight) : displayHeight; 
  const displayWidth = isCastingMagic ? displayHeight * (magicFrameWidth / stopSheetHeight) : displayHeight * (frameWidth / frameHeight); 
  
  const halfWidth = displayWidth / 2; 
  characterX = constrain(characterX, halfWidth, width - halfWidth); 
  
  if (!isCastingMagic && moveDirection > 0) { 
    const rightEdge = width - halfWidth; 
    characterX = min(characterX + min(width, height) * 0.008, rightEdge); 
    if (characterX >= rightEdge) moveDirection = 0; 
  } 
  if (!isCastingMagic && moveDirection < 0) { 
    const leftEdge = halfWidth; 
    characterX = max(characterX - min(width, height) * 0.008, leftEdge); 
    if (characterX <= leftEdge) moveDirection = 0; 
  } 
  
  const effectImage = magicEffectFrames[effectFrame]; 
  const effectWidth = displayHeight * (magicFrameWidth / stopSheetHeight); 
  const effectHeight = displayHeight * (magicSheetHeight / stopSheetHeight); 
  let effectReachedEdge = false; 
  
  if (effectActive) { 
    effectX += effectDirection * min(width, height) * 0.015; 
    if (effectDirection > 0 && effectX >= width - effectWidth / 2) { 
      effectX = width - effectWidth / 2; 
      effectReachedEdge = true; 
    } 
    if (effectDirection < 0 && effectX <= effectWidth / 2) { 
      effectX = effectWidth / 2; 
      effectReachedEdge = true; 
    } 
  } 
  
  const posY = height - characterDisplayHeight / 2; 
  const activeFrames = isCastingMagic ? magicFrames : isWalking ? walkFrames : stopFrames; 
  const activeFrame = isCastingMagic ? magicFrame : currentFrame; 
  
  if (effectActive) { 
    push(); 
    translate(effectX, height - displayHeight / 2); 
    scale(effectDirection, 1); 
    image(effectImage, 0, 0, effectWidth, effectHeight); 
    pop(); 
    if (effectReachedEdge) effectActive = false; 
  } 
  
  push(); 
  translate(characterX, posY); 
  scale(facingDirection, 1); 
  image(activeFrames[activeFrame], 0, 0, displayWidth, characterDisplayHeight); 
  pop(); 
  
  if (frameCount % animSpeed === 0) { 
    if (effectActive) effectFrame = (effectFrame + 1) % magicEffectFrameCount; 
    if (isCastingMagic) { 
      if (magicFrame < magicFrameCount - 1) magicFrame++; 
      else { 
        isCastingMagic = false; 
        startMagicEffect(); 
        updateMovementState(); 
      } 
    } else { 
      currentFrame = (currentFrame + 1) % totalFrames; 
    } 
  } 
}

// 在視窗尺寸改變時重新調整畫布大小。
function windowResized() { 
  resizeCanvas(windowWidth, windowHeight); 
}