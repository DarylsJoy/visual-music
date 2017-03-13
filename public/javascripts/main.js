var menuBtn = document.getElementById('menu-btn');
var togMusic = document.getElementById('togMusic');
var musicList = document.getElementById('music-list');
var items = document.getElementsByClassName('m-items');
var mask = document.getElementById('mask');
var volume = document.getElementById('volume');
var tip = document.getElementById('tip');

menuBtn.addEventListener('click', showList);
mask.addEventListener('click', hideList);

// 用户检测
var u = navigator.userAgent;
var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端


var line;

var size = 128;

var viewContent = document.getElementById('view-content');
var width, height;
var canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d');
viewContent.appendChild(canvas);

window.onload = function () {
  tip.style.top = 0;
  setTimeout("tip.style.top = -100 + 'px'", 5000);
};

var dots = [];

draw.type = 'dot';

var mv = new MusicVisualizer({
  size: size,
  visualizer: draw
});

togMusic.addEventListener('click', function () {
  if (this.classList.contains('m-stop')) {
    this.innerHTML = '还是继续吧';
    mv.audio.pause();
    this.classList.toggle('m-stop');
  } else {
    this.innerHTML = '暂停一下';
    mv.audio.play();
    this.classList.toggle('m-stop');
  }
})

// 添加事件
for (var i = 0, l = items.length; i < l; i ++) {
  items[i].addEventListener('click', function () {
    hideList();
    for (var j = 0; j < l; j ++) {
      items[j].classList.remove('selected');
    }
    this.classList.add('selected');
    // mv.xhrPlay('/media/' + this.title);
    mv.audioPlay('/media/' + this.title);
    if (isiOS) {
      var iosautoplay = setInterval(function () {
        if (mv.audio.readyState == 2 || mv.audio.readyState == 3 || mv.audio.readyState == 4) {
          mv.audio.play();
          clearInterval(iosautoplay);
          console.log(mv.audio.readyState);
        }
      }, 100);
    }
    togMusic.innerHTML = '暂停一下';
    togMusic.classList.add('m-stop');
  })
}

// 歌曲列表弹出与隐藏
function showList() {
  musicList.style.left = 0;
  mask.style.opacity = 0.4;
  mask.style.zIndex = 5;
}
function hideList() {
  musicList.style.left = - 300 + 'px';
  mask.style.opacity = 0;
  mask.style.zIndex = -1;
}

// 可视化类型切换
var types = document.getElementsByClassName('types');
for (var x = 0, le = types.length; x < le; x ++) {
  types[x].addEventListener('click', function () {
    for (var j = 0; j < le; j ++) {
      types[j].classList.remove('type-selected');
    }
    this.classList.add('type-selected');
    draw.type = this.getAttribute('data-type');
  })
}

// 返回m-n间随机整数
function random(m, n) {
  return Math.round(Math.random() * (n - m) + m);
}
function getDots() {
  dots = [];
  for (var i = 0; i < size; i ++) {
    var x = random(0, width);
    var y = random(0, height);
    var color = 'rgba(' + random(20, 230) + ',' + random(20, 230) + ',' + random(20, 230) + ',0)';
    dots.push({
      x: x,
      y: y,
      dx: random(1, 4),
      color: color
    })
  }
}

// 绘制水印
function drawLogo() {
  var logo = new Image();
  logo.src = '/images/background.png';
  ctx.drawImage(logo, width - 200, height - width * 0.06, 160, 50);
}

// 浏览器尺寸变化时获取尺寸并改变canvas
function reSize() {
  width = viewContent.clientWidth;
  height = viewContent.clientHeight;
  canvas.width = width;
  canvas.height = height;
  line = ctx.createLinearGradient(0, 0, 0, height);
  line.addColorStop(0, "#ffffff");
  line.addColorStop(0.5, "#99cccc");
  line.addColorStop(1, "#336699");
  getDots();
}
reSize();
window.onresize = reSize;

function draw(arr) {
  ctx.clearRect(0, 0, width, height);
  var w = width / size;
  if (draw.type == 'column') {
    ctx.fillStyle = line;
    for (var i = 0; i < size; i ++) {
      var h = arr[i] / 256 * height;
      ctx.fillRect(w * i, height - h, w * 0.8, h);
    }
  } else if (draw.type == 'dot') {
    for (var j = 0; j < size; j ++) {
      ctx.beginPath();
      var o = dots[j];
      var r = 10 + arr[j] / 256 * (height > width ? width : height) / 10;
      ctx.arc(o.x, o.y, r, 0, Math.PI * 2, true);
      var roundStyle = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
      roundStyle.addColorStop(0, '#ffffff');
      roundStyle.addColorStop(1, o.color);
      ctx.fillStyle = roundStyle;
      ctx.fill();
      o.x += o.dx;
      o.x = o.x > width ? 0 : o.x;
    }
  }
  drawLogo();
}

volume.addEventListener('mousemove', function () {
  mv.changeVolume(this.value / this.max);
})
volume.addEventListener('touchmove', function () {
  mv.changeVolume(this.value / this.max);
})
mv.changeVolume(60 / 100);