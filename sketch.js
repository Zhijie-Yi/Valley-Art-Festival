let images = []; // 存放图片对象的数组
let paths = []; // 存放所有路径的数组，每个路径包含其点的数组
let growingImages = []; // 存储将要绘制的图片信息及时间戳的数组
let scaleFactor = 0.15; // 统一的缩放因子
let bgImage; // 存储背景图片的变量

function preload() {
  // 预加载图片
  const imageNames = ['img (1).png', 'img (2).png', 'img (3).png', 'img (4).png', 'img (5).png', 'img (6).png','img (7).png','img (8).png'];
  imageNames.forEach(name => images.push(loadImage(name)));
    // 加载背景图片
  bgImage = loadImage('bg .png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 不再需要在这里设置背景色，因为我们将使用背景图片
}

function draw() {
   background(0,255,117);
  // image(bgImage, 0, 0, width, height);
  let currentMillis = millis();

  // 绘制所有路径
  paths.forEach(path => {
    if (path.length < 12) return; // 至少需要12个点来绘制平滑曲线（包括重复的开始和结束点）

    beginShape();
    stroke(17, 38, 253);
    strokeWeight(20);
    noFill();

    // 重复第一个点作为曲线的起始控制点
    curveVertex(path[0].x, path[0].y);

    // 绘制路径点
    for (let i = 0; i < path.length; i++) {
      let p = path[i];
      if (currentMillis - p.time > 2000) {
        path.splice(i, 1);
        i--; // 调整循环索引
      } else {
        curveVertex(p.x, p.y);
      }
    }

    // 重复最后一个点作为曲线的结束控制点
    if (path.length > 0) { // 确保路径中还有点
      curveVertex(path[path.length - 1].x, path[path.length - 1].y);
    }

    endShape();
  });

// 在draw()函数中处理每张图片的生长与消失
for (let i = growingImages.length - 1; i >= 0; i--) {
  let imgInfo = growingImages[i];
  let timePassed = currentMillis - imgInfo.time;
  let size = 0; // 默认size为0

  // 根据时间段来调整size
  if (timePassed < 500) {
    size = map(timePassed, 0, 500, 0, imgInfo.img.width * scaleFactor);
  } else if (timePassed >= 500 && timePassed < 1500) {
    size = imgInfo.img.width * scaleFactor; // 图片最大尺寸阶段
  } else if (timePassed >= 1500 && timePassed < 2500) {
    size = map(timePassed, 1500, 2500, imgInfo.img.width * scaleFactor, 0); // 图片缩小阶段
  }

  // 超过生命周期后从数组中移除
  if (timePassed >= 2500) {
    growingImages.splice(i, 1);
    continue; // 跳过当前循环的剩余部分
  }

  // 在绘制图片前检查size是否有效，避免绘制原始尺寸的图片
  if (size > 0) {
    let offsetX = size / 2;
    let offsetY = (size * (imgInfo.img.height / imgInfo.img.width)) / 2;
    image(imgInfo.img, imgInfo.x - offsetX, imgInfo.y - offsetY, size, size * (imgInfo.img.height / imgInfo.img.width));
  }
}
}

function mousePressed() {
  // 每次鼠标按下时开始一个新的路径
  paths.push([]);
}

function mouseDragged() {
  // 向当前路径添加点
  if (paths.length > 0) {
    const currentPath = paths[paths.length - 1];
    currentPath.push({x: mouseX, y: mouseY, time: millis()});
    
    if (random(1) < 0.08) { // 以一定的概率在路径上添加图片
      const img = random(images);
      growingImages.push({
        img: img,
        x: mouseX + random(-50, 50),
        y: mouseY + random(-50, 50),
        time: millis()
      });
    }
  }
  
  return false; // 防止默认的拖动行为
}
