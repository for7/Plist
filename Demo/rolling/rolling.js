
!function(){
  var global = window
  function Rolling (config) {
    this.config = config
    this.contentEl = '' // 容器
    this.rollingId = 0 // 内部随机ID
    this.contentEl_height = 0 // 容器的高度（内边距）
    this.contentEl_width = 0 // 容器的宽度（内边距）
    this.isAutoContent = true // 是否让子元素（box）默认填充满容器
    this.boxNum = 2 // 动画DIV个数
    this.animationBox = [] // 动画元素的DOM
    this.nextDisplayBoxIndex = 1 // 下个出场的box的系列号 index 默认1 (1, 2)
    this.nextEntrBackgroundIndex = 2 // 下一个进入隐藏的box 的系列号
    this.nextEnterEl = '' // 下轮进入的元素
    this.nextGoOutEl = '' // 下轮出的元素
    this.isPass = true //
    this.isRun= true // 是否运行
    this.textIndex = 0
    this.timeHeader = 0 // 定时器
    this.timeLong = 2500
    this.init()
  }
  Rolling.prototype.init = function () {
    if (!this.config) return
    this.rollingId = parseInt(Math.random() * 1000) // 生成内部随机ID
    this.contentEl = document.querySelector(this.config.content)
    if (!this.contentEl) {
      console.log('获取容器失败')
      return
    }
    this.contentEl.style.position = 'relative'
    this.contentEl_height = this.contentEl.clientHeight
    this.contentEl_width = this.contentEl.clientWidth
    this.createBox()
    // 执行动画滚动
    this.run()
  }
  // 生成Box：默认的两个虚拟动画单元
  Rolling.prototype.createBox = function () {
    var self = this
    var boxHtml = ''
    var num = this.boxNum
    for (var i = 1; i <= num; i++) {
      var style = ''
      var boxID = 'rolling_box_' + this.rollingId
      var boxID_self = ' rolling_box_' + this.rollingId + '_' + i
      if (this.isAutoContent) {
        style = 'width: ' + this.contentEl_width + 'px; height:auto;' + 'position: ' + 'absolute;' + 'top: 0;' + 'left: 0;'
      }
      if (i === 1) {
        style += 'transform:translate3d(0, 0px, 0);'
      }
      if (i === 2) {
        style += 'transform:translate3d(0,  ' + this.contentEl_height + 'px, 0);'
      }
      var det = this.config.data ? this.config.data[i] : i
      boxHtml += '<div class="rolling_box '+ boxID + boxID_self +'" style="'+ style +'">'+ det +'</div>'
    }
    this.contentEl.innerHTML = boxHtml
    // 缓存动画单元的DOM
    for (var i = 1; i<= num; i++) {
      var boxEl = document.querySelector('.rolling_box_' + this.rollingId + '_' + i)
      if (boxEl) {
        this.animationBox.push(boxEl)
      }
    }
    // this.animationBox[0].addEventListener("transitionend", this.runAfter.bind(self));
    this.contentEl.style.transform = 'translateZ(0)'
    this.contentEl.addEventListener("transitionend",  this.runAfter.bind(self));
    this.contentEl.addEventListener("mouseenter",  function (e) {
      self.isRun = false
      clearTimeout(self.timeHeader)
    }, true);
    this.contentEl.addEventListener("mouseleave",  function () {
      self.isRun = true
      clearTimeout(self.timeHeader)
      self.run()
    }, true);
  }
  Rolling.prototype.run = function () {
    // this.runBefore()
    this.timer()
  }
  Rolling.prototype.timer = function () {
    var self = this
    this.timeHeader = setTimeout(function () {
      self.runBefore()
      if (self.isRun) {
        self.timer()
      }
    }, self.timeLong)
  },
  Rolling.prototype.runBefore = function () {
    this.nextEnterEl = this.animationBox[this.nextDisplayBoxIndex - 1]
    this.nextGoOutEl = this.animationBox[this.nextEntrBackgroundIndex - 1]
    this.changeText()
    this.runing()
  }
  Rolling.prototype.runing = function () {
    this.nextEnterEl.style.transition = 'transform 300ms linear 1ms'
    this.nextGoOutEl.style.transition = 'transform 300ms linear 1ms'
    this.nextEnterEl.style.transform = 'translate3d(0, ' + -this.contentEl_height + 'px, 0)'
    this.nextGoOutEl.style.transform = 'translate3d(0, '+ 0 +'px, 0)'
    this.isPass = true
  }
  Rolling.prototype.runAfter = function () {
    // 交换上轮入场和出场的元素索引
    if(!this.isPass) return
    var modVlaue = this.nextDisplayBoxIndex
    this.nextDisplayBoxIndex = this.nextEntrBackgroundIndex
    this.nextEntrBackgroundIndex = modVlaue
    var nextEnterEl = this.animationBox[this.nextEntrBackgroundIndex - 1]
    nextEnterEl.style.transition = 'transform 0s linear 1ms'
    nextEnterEl.style.transform = 'translate3d(0, '+ this.contentEl_height +'px, 0)'
    this.isPass = false
  }
  Rolling.prototype.changeText = function () {
    var nextEnterEl = this.animationBox[this.nextEntrBackgroundIndex - 1]
    if (this.textIndex >= this.config.data.length) {
      this.textIndex = 0
    }
    nextEnterEl.innerHTML = this.config.data[this.textIndex]
    this.textIndex ++
  }
  if (global) {
    global['Rolling'] = Rolling
  }
}()
