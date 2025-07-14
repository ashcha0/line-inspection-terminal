<template>
  <div class="fault-dialog-container">
    <!-- 消息历史区域 -->
    <div class="message-history">
      <div v-for="(msg, idx) in messages" :key="idx" :class="['message', msg.role]">
        <div class="avatar">
          <el-icon v-if="msg.role === 'user'"><User /></el-icon>
          <el-icon v-else><ChatLineRound /></el-icon>
        </div>
        <div class="content">
          <!-- 流式输出渲染 -->
          <template v-if="msg.isStreaming">
            <div class="streaming-output">
              {{ streamingContent }}
              <span class="streaming-cursor"></span>
            </div>
          </template>
          
          <!-- 结构化数据渲染 -->
          <template v-else-if="msg.analysis">
            <div class="analysis-section">
              <p><strong>故障类型：</strong><el-tag>{{ msg.analysis.faultType }}</el-tag></p>
              <p><strong>危险等级：</strong>
                <el-tag :type="msg.analysis.riskLevel === '高' ? 'danger' : 'warning'">
                  {{ msg.analysis.riskLevel }}
                </el-tag>
              </p>
              <div class="suggestions">
                <strong>处置建议：</strong>
                <ol>
                  <li v-for="(step, stepIdx) in msg.analysis.suggestions" :key="stepIdx">{{ step }}</li>
                </ol>
              </div>
              <p v-if="msg.analysis.note" class="note">
                <el-icon><InfoFilled /></el-icon> {{ msg.analysis.note }}
              </p>
            </div>
          </template>
          
          <!-- 普通文本消息 -->
          <template v-else>{{ msg.content }}</template>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <el-input
        v-model="userInput"
        type="textarea"
        :rows="3"
        placeholder="请输入故障信息，例如：K7+500处发现纵向裂缝长2.3m，宽约5mm..."
        resize="none"
      ></el-input>
      <el-button 
        type="primary" 
        @click="sendFaultReport"
        :disabled="isSending"
        :loading="isSending"
      >
        <el-icon><Promotion /></el-icon> {{ isSending ? '分析中...' : '发送分析' }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { User, ChatLineRound, Promotion, InfoFilled } from '@element-plus/icons-vue';
import difyService from '@/services/difyService';

export default {
  components: { User, ChatLineRound, Promotion, InfoFilled },
  data() {
    return {
      userInput: '',
      isSending: false,
      messages: [
        {
          role: 'assistant',
          content: '您好！我是地铁隧道故障分析助手。请粘贴巡线车采集的故障信息，我将为您提供专业分析报告。'
        }
      ]
    };
  },
  methods: {
    async sendFaultReport() {
      if (!this.userInput.trim()) return;
      
      // 添加用户消息
      this.messages.push({ role: 'user', content: this.userInput });
      this.$nextTick(() => this.scrollToBottom());
      
      const faultInfo = this.userInput;
      this.userInput = '';
      this.isSending = true;
      
      // 添加流式消息占位符
      const assistantMessage = {
        role: 'assistant',
        isStreaming: true,
        content: '', // 初始化一个空的 content 用于拼接
        analysis: null // 初始化 analysis 属性
      };
      this.messages.push(assistantMessage);
      this.$nextTick(() => this.scrollToBottom());
      
      try {
        await difyService.analyzeFaultStream(
          faultInfo,
          (chunk) => {
            // 实时更新流式内容
            assistantMessage.content += chunk;
            this.$nextTick(() => this.scrollToBottom());
          },
          () => {
            // 流式传输完成后的处理
            assistantMessage.isStreaming = false;
            this.isSending = false;
            
            // 尝试提取最终答案内容
            const finalAnswerMatch = assistantMessage.content.match(/"action":\s*"Final Answer"\s*,\s*"action_input":\s*"([^"]*)"/);
            if (finalAnswerMatch && finalAnswerMatch[1]) {
              assistantMessage.content = finalAnswerMatch[1];
            }
            
            this.$nextTick(() => this.scrollToBottom());
          },
          (error) => {
             // 处理从 service 传来的错误
            console.error('分析失败:', error);
            assistantMessage.isStreaming = false;
            assistantMessage.content = error.message || '分析服务异常';
            this.isSending = false;
            this.$nextTick(() => this.scrollToBottom());
          }
        );
        
      } catch (error) {
        console.error('sendFaultReport顶层捕获异常:', error);
        this.isSending = false;
      }
    },
    scrollToBottom() {
      const container = this.$el.querySelector('.message-history');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }
};
</script>

<style scoped>
/* 新增流式输出样式 */
.streaming-output {
  min-height: 1.5em;
  line-height: 1.6;
}

.streaming-cursor {
  display: inline-block;
  width: 8px;
  height: 1.2em;
  background-color: #409eff;
  margin-left: 2px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.fault-dialog-container {
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.message-history {
  height: 400px;
  padding: 20px;
  overflow-y: auto;
  background-color: #fafafa;
}

.message {
  display: flex;
  margin-bottom: 20px;
}

.message.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e6f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 15px;
  flex-shrink: 0;
}

.message.user .avatar {
  background: #f0f7ff;
}

.content {
  max-width: 70%;
  padding: 12px 18px;
  border-radius: 4px;
  line-height: 1.6;
}

.message.assistant .content {
  background: #fff;
  border-left: 4px solid #409eff;
}

.message.user .content {
  background: #409eff;
  color: white;
}

.analysis-section {
  border-top: 1px dashed #eee;
  padding-top: 10px;
  margin-top: 10px;
}

.suggestions {
  margin: 10px 0;
}

.note {
  padding: 8px;
  background: #fef2e8;
  border-radius: 4px;
  color: #e6a23c;
  margin-top: 10px;
}

.input-area {
  padding: 15px;
  border-top: 1px solid #e4e7ed;
  background: #fff;
}
</style>
