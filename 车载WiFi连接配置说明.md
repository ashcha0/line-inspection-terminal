# 车载WiFi连接配置说明

## 连接步骤

### 1. 连接车载WiFi
- **SSID**: `inhand`
- **密码**: `12345678`
- **车载服务器地址**: `http://192.168.2.2`

### 2. 需要修改的文件

#### 2.1 修改 Vite 代理配置 (`frontend/vite.config.ts`)
```typescript
// 在 proxy 配置中：
'/prod-api': {
  // 注释掉本地开发配置
  // target: 'http://localhost:8080',
  // 启用车载WiFi配置
  target: 'http://192.168.2.2',
  changeOrigin: true,
},
'/webrtc-api': {
  // 注释掉本地开发配置
  // target: 'http://localhost:8080',
  // 启用车载WiFi配置
  target: 'http://192.168.2.2',
  changeOrigin: true,
  ws: true,
},
```

#### 2.2 修改 API 请求配置 (`frontend/src/api/request.ts`)
```typescript
const service: AxiosInstance = axios.create({
  // 注释掉本地开发配置
  // baseURL: '/prod-api',
  // 启用车载WiFi配置
  baseURL: 'http://192.168.2.2/prod-api',
  timeout: 10000
})
```

#### 2.3 修改视频流配置 (`frontend/src/views/TaskExecuteView.vue`)
```typescript
// 在 playStream 函数中：
// 注释掉本地开发配置
// const webrtcUrl = `/webrtc-api/index/api/webrtc?app=live&stream=${currentStreamId.value}&type=play`
// 启用车载WiFi配置
const webrtcUrl = `http://192.168.2.2/webrtc-api/index/api/webrtc?app=live&stream=${currentStreamId.value}&type=play`

// 在 toggleAudio 函数中：
// 注释掉本地开发配置
// const audioUrl = `/webrtc-api/index/api/webrtc?app=live&stream=5&type=play`
// 启用车载WiFi配置
const audioUrl = `http://192.168.2.2/webrtc-api/index/api/webrtc?app=live&stream=5&type=play`
```

### 3. 调试步骤

1. **连接WiFi**: 连接到 `inhand` WiFi网络
2. **修改配置**: 按照上述说明修改相应文件
3. **重启服务**: 重启前端开发服务器
4. **测试连接**: 访问系统自检页面，检查AGV连接状态
5. **测试视频流**: 进入任务执行页面，测试视频流是否正常

### 4. 故障排除

- **无法连接车载服务器**: 检查WiFi连接和IP地址是否正确
- **视频流无法播放**: 检查webrtc-api地址和流媒体服务状态
- **API请求失败**: 检查prod-api地址和网络连接

### 5. 切换回本地开发

调试完成后，将上述配置改回本地开发模式：
- 恢复 `localhost:8080` 配置
- 注释掉 `192.168.2.2` 配置
- 重启开发服务器

## 注意事项

- 确保车载设备已启动并正常运行
- 检查车载WiFi信号强度
- 注意网络延迟对实时视频流的影响
- 建议在连接车载WiFi前先备份当前配置 