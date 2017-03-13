/**
 * 音乐可视化对象
 */

function MusicVisualizer(obj) {
  this.source = null;   // 正在播放节点

  this.count = 0;   // 控制点击次数

  this.analyser = MusicVisualizer.ac.createAnalyser();   // 分析节点
  this.size = obj.size;   // 数据大小
  this.analyser.fftSize = this.size * 2;   // fft的大小

  this.gainNode = MusicVisualizer.ac[MusicVisualizer.ac.createGain ? "createGain" : "createGainNode"]();  // 控制音量节点
  this.gainNode.connect(MusicVisualizer.ac.destination);

  this.analyser.connect(this.gainNode);

  this.xhr = new XMLHttpRequest();   // Ajax对象

  this.visualizer = obj.visualizer;

  // 声明 MediaElementAudioSourceNode 变量
  this.sound = null;
  this.audio = new Audio() || document.createElement('audio');

  this.visualize();
}

MusicVisualizer.ac = new (window.AudioContext || window.webkitAudioContext)();

// 请求音乐
MusicVisualizer.prototype.load = function (url, fun) {
  this.xhr.abort();
  this.xhr.open("GET", url);
  this.xhr.responseType = "arraybuffer";
  var self = this;
  this.xhr.onload = function () {
    if (self.xhr.status >= 200 && self.xhr.status < 300 || self.xhr.status == 304) {
      fun(self.xhr.response);
    } else {
      alert('出错了：' + self.xhr.status);
    }
  }
  this.xhr.send();
};


MusicVisualizer.prototype.decode = function (arraybuffer, fun) {
  MusicVisualizer.ac.decodeAudioData(arraybuffer, function (buffer) {
    // 成功
    fun(buffer);
  }, function (err) {
    // 失败
    console.log(err);
  });
};

// Ajax预加载播放
MusicVisualizer.prototype.xhrPlay = function (url) {
  var n = ++ this.count;
  var self = this;
  this.source && this.stop();
  this.load(url, function (arraybuffer) {
    if (n != self.count) { return; }
    self.decode(arraybuffer, function (buffer) {
      if (n != self.count) { return; }
      var bs = MusicVisualizer.ac.createBufferSource();
      bs.connect(self.analyser);
      bs.buffer = buffer;
      bs[bs.start ? "start" : "noteOn"](0);
      self.source = bs;
    })
  })
};


// HTML Media元素流式加载播放
MusicVisualizer.prototype.audioPlay = function (url) {
  this.audio.pause();
  this.audio.currentTime = 0.0;
  this.audio = new Audio() || document.createElement('audio');
  this.audio.crossOrigin = "anonymous";
  this.audio.src = url;
  this.sound = null;
  var self = this;
  this.audio.addEventListener('canplay', function() {
    /* 现在这个文件可以 `canplay` 了, 从 `<audio>` 元素创建一个
     * MediaElementAudioSourceNode(媒体元素音频源结点) . */
    self.sound = MusicVisualizer.ac.createMediaElementSource(self.audio);
    /* 将 MediaElementAudioSourceNode 与 AudioContext 关联 */
    self.sound.connect(self.analyser);
    self.audio.play();
  });
};

// 停止
MusicVisualizer.prototype.stop = function () {
  this.source[this.source.stop ? "stop" : "noteOff"](0);
};

// 音量控制
MusicVisualizer.prototype.changeVolume = function (percent) {
  this.gainNode.gain.value = percent * percent;
};

// 可视化
MusicVisualizer.prototype.visualize = function () {
  var arr = new Uint8Array(this.analyser.frequencyBinCount);
  requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
  var self = this;
  function v() {
    self.analyser.getByteFrequencyData(arr);
    self.visualizer(arr);
    requestAnimationFrame(v);
  }
  requestAnimationFrame(v);
};

// 音量控制
MusicVisualizer.prototype.changeVolume = function (percent) {
  this.gainNode.gain.value = percent * percent;
};
