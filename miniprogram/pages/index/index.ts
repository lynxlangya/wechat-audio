// index.ts
// 获取应用实例
const app = getApp<IAppOption>();

let audioCtx: any;

Page({
  data: {
    isPlay: false,
    isLike: false,
    hasTime: 0,
    regularPlayingTime: 0,
    detailInfo: {
      title: '假做真时真亦假，无为有处有还无',
      image: 'https://pic.qtfm.cn/channel/2019/02/14/e064c98bb1327206ee100e0ae79c88c5.jpg!400',
      path: 'https://wyatest.oss-cn-hangzhou.aliyuncs.com/image/0/20220403/102844/%E9%9F%B3%E9%A2%91001.mp3',
      maxTime: 590,
    }
  },

  onLoad() {},

  // 生成音频实例
  onReady() {
    const { detailInfo } = this.data;
    audioCtx = wx.createInnerAudioContext();
    audioCtx.src = detailInfo.path;
    // 监听音频播放进度更新事件
    this._handleTimeUpdate();

    // 监听音频播放事件
    this._handlePlay();
  },

  _handlePlay() {
    audioCtx.onPlay(() => {
      console.log('开始播放');
    });
  },

  // 播放进度更新
  _handleTimeUpdate() {
    audioCtx.onTimeUpdate(() => {
      console.log('播放进度更新');
      const { regularPlayingTime } = this.data;
      const time = audioCtx.currentTime;
      this.setData({ hasTime: time });
      // 定时播放
      if (regularPlayingTime && audioCtx.currentTime >= regularPlayingTime) {
        audioCtx.pause();
        this.setData({ isPlay: false });
      }
    });
  },

  // 播放|暂停
  handleChangePlay() {
    const { isPlay } = this.data;
    if (isPlay) audioCtx.pause();
    else audioCtx.play();
    this.setData({ isPlay: !isPlay });
  },

  /** 
   * ios 中音频播放不出来，需要encodeURI编码
   * 可调用此方法
   */
	_handleAudioUrl(url: string): string | void {
		const fileName: string | undefined = url.split('/').pop();
    if (fileName) {
      const encodeFileName = encodeURIComponent(fileName);
      return url.replace(fileName, encodeFileName);
    }
    wx.showToast({
      title: '音频地址错误',
      icon: 'none',
    });
	},

  handleDownload() {
    wx.showLoading({ title: '下载中' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '下载成功' });
    }, 2000);
  },

  handleMore() {
    wx.showToast({ title: '自定义功能', icon: 'none' });
  },

  handleDilemma(e: AnyObject) {
		audioCtx.pause();
    const { v } = e.currentTarget.dataset;
		const { hasTime, isPlay } = this.data;
    const { duration } = audioCtx;
		const time = v == 2 ? +hasTime + 15 : (+hasTime - 15 < 0 ? 0 : +hasTime - 15);
		audioCtx.seek(time);
		this.setData({
			hasTime: time < duration ? time : duration.toFixed(0)
		});
    // 此处需要延迟执行，否则进度条不会更新
		if (isPlay) setTimeout(() => audioCtx.play(), 200);
  },

  handleTiming() {
    const list = ['关闭', '播完当前', '5分钟', '10分钟', '20分钟', '30分钟'];
		wx.showActionSheet({
      itemList: list,
			success: (res) => {
				if (res.tapIndex !== 0 && res.tapIndex !== 1) {
					this.setData({
            // @ts-ignore
						regularPlayingTime: list[res.tapIndex].replace(/分钟/g, '') * 1 + (+this.data.hasTime)
					});
				} else {
          this.setData({ regularPlayingTime: 0 });
        }
			}
		});
  },

  handleList(): void {
    wx.showToast({ title: '播放列表', icon: 'none' });
  },

  handleChangeSwitch(e: AnyObject): void {
    const { v } = e.currentTarget.dataset;
    if (v === '1') {
      wx.showToast({ title: '上一首', icon: 'none' });
    } else {
      wx.showToast({ title: '下一首', icon: 'none' });
    }
  },

  handleSpeed(): void {
    const list = ['0.5x', '0.75x', '1x', '1.25x', '1.5x', '2x'];
    const { isPlay } = this.data;
    wx.showActionSheet({
      itemList: list,
      success: (res) => {
        // @ts-ignore
        let speed = list[res.tapIndex].replace(/x/g, '') * 1;
        audioCtx.playbackRate = speed;
        audioCtx.pause();
        if (isPlay) setTimeout(() => audioCtx.play(), 200);
      }
    });
  },

  handleChangeSlider(e: AnyObject): void {
    const { value } = e.detail;
    const { isPlay } = this.data;
		this.setData({ hasTime: value });
		audioCtx.seek(value);
    if (isPlay) wx.nextTick(() => audioCtx.play());
  },

  /** 
   * 在拖动进度条时，暂停播放
   * 如果拖动时也需要播放，可在此实时赋值
   * audioCtx.seek(value)
   */
  handleChangingSlider(): void {
    audioCtx.pause();
  },

  handleLike() {
    this.setData({ isLike: !this.data.isLike });
  },
});
