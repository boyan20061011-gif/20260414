let seeds = [];
let vinePoints = [];
let seaweeds = []; // 新增：背景海草陣列
const totalWeeks = 8; // 假設有 8 週的作品

function setup() {
  // 自動抓取容器寬度，使佈局更彈性
  let container = document.getElementById('timeline-canvas');
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent(container);
  initTimeline();
}

function initTimeline() {
  // 清空舊數據以便重新計算（用於視窗縮放時）
  vinePoints = [];
  seeds = [];
  seaweeds = [];

  // 【Vertex & For】: 計算藤蔓的曲線座標，根據當前高度動態分佈
  for (let i = 0; i < 100; i++) {
    let y = map(i, 0, 100, height - 40, 60); // 增加上下間距
    let x = width / 2 + sin(i * 0.3) * 30;  // 產生波浪感
    vinePoints.push({ x, y });
  }

  // 初始化背景海草
  for (let i = 0; i < 10; i++) { // 稍微減少數量讓視覺更乾淨
    seaweeds.push(new Seaweed(random(width)));
  }

  // 【Class】: 在藤蔓路徑上平均分佈種子節點
  for (let i = 0; i < totalWeeks; i++) {
    let pIdx = floor(map(i, 0, totalWeeks - 1, 10, 90));
    let p = vinePoints[pIdx];
    // 將第一週連結改為 20260224，其餘預留
    let url = (i === 0) ? "20260224/index.html" : `week${i + 1}/index.html`;
    seeds.push(new Seed(p.x, p.y, i + 1, url));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initTimeline();
}

function draw() {
  clear(); // 清除畫布，使其透明以顯示後方的 iframe
  // 加入淡淡的背景色遮罩，讓水草更顯眼
  fill(255, 255, 255, 30);
  rect(0, 0, width, height);

  // 繪製背景海草
  for (let sw of seaweeds) {
    sw.display();
  }

  // 繪製藤蔓主幹
  noFill();
  stroke(100, 140, 100);
  strokeWeight(5);
  beginShape();
  for (let p of vinePoints) {
    vertex(p.x, p.y);
  }
  endShape();

  // 更新並顯示種子節點
  let hoveringAny = false;
  for (let s of seeds) {
    s.update();
    s.display();
    if (s.isHovered()) hoveringAny = true;
  }

  // 若滑鼠懸停在任何花朵上，改變游標樣式
  if (hoveringAny) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
}

function mousePressed() {
  for (let s of seeds) {
    if (s.isHovered() && s.wk === 1) {
      // 【Iframe 整合】: 當點擊時，修改 iframe 的 src
      let iframe = document.getElementById('project-frame');
      if (iframe) iframe.src = s.url;
      console.log("正在切換至：" + s.url); // 於主控台確認切換路徑
    } else if (s.isHovered()) {
      console.log("此週次尚未加入內容");
    }
  }
}

class Seaweed {
  constructor(x) {
    this.x = x;
    this.segments = 15;
    this.h = random(100, 300);
    this.offset = random(1000);
  }
  display() {
    stroke(100, 140, 100, 80); // 調整透明度，避免遮擋作品
    strokeWeight(2);
    noFill();
    beginShape();
    for (let i = 0; i <= this.segments; i++) {
      let y = map(i, 0, this.segments, height, height - this.h);
      // 使用 noise 產生海草搖擺效果
      let xSide = noise(this.offset + i * 0.1 + frameCount * 0.01) * 60 - 30;
      vertex(this.x + xSide, y);
    }
    endShape();
  }
}

class Seed {
  constructor(x, y, wk, url) {
    this.x = x;
    this.y = y;
    this.wk = wk;
    this.url = url;
    this.r = 12;
    this.targetR = 12;
    this.angle = 0;
  }
  update() {
    // 當滑鼠懸停時產生動態效果
    this.targetR = this.isHovered() ? 35 : 12;
    this.r = lerp(this.r, this.targetR, 0.15);
    if (this.isHovered()) this.angle += 0.05;
  }
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);

    // 設定花朵顏色（懸停時轉為粉嫩色）
    let flowerColor = this.targetR > 12 ? color(255, 150, 180) : color(100, 180, 120);
    fill(flowerColor);
    noStroke();

    // 【Vertex】: 繪製花瓣圖案
    beginShape();
    for (let a = 0; a < TWO_PI; a += 0.1) {
      // 使用 sin 函數計算半徑偏移，產生 5 片花瓣的效果
      let rOffset = this.r * (1 + 0.4 * sin(a * 5)); 
      let vx = cos(a) * rOffset;
      let vy = sin(a) * rOffset;
      vertex(vx, vy);
    }
    endShape(CLOSE);

    // 繪製花蕊
    fill(255, 230, 150);
    circle(0, 0, this.r * 0.5);

    // 標註週次
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(this.r * 0.8);
    text(this.wk, 0, 0);
    pop();
  }
  isHovered() {
    return dist(mouseX, mouseY, this.x, this.y) < this.r;
  }
}
