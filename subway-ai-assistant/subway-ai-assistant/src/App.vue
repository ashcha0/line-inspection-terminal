<template>
  <div id="app">
    <!-- 替换故障分析对话框为 iframe -->
    <div class="iframe-container">
      <iframe
        src="http://localhost/chatbot/2clWMV1HuWgTrtRn"
        frameborder="0"
        allow="microphone">
      </iframe>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* 移除原有对话框样式 */
#app {
  min-height: 100vh;
  padding: 0; /* 移除内边距 */
}

.iframe-container {
  width: 100%;
  min-height: 700px;
  height: 100vh; /* 全屏高度 */
}

.iframe-container iframe {
  width: 100%;
  height: 100%;
  display: block; /* 消除底部间隙 */
}
</style>