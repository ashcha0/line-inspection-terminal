const baseURL = 'http://localhost/v1';
const apiKey = 'app-bqrzJV3VBLxJA03eHZd2DwSo';

export default {
  async analyzeFaultStream(fullDescription, onDataReceived, onCompleted, onError) {
    try {
      const response = await fetch(`${baseURL}/chat-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          inputs: { description: fullDescription },
          query: "地铁隧道故障分析",
          response_mode: "streaming",
          user: "subway-engineer"
        })
      });

      if (!response.ok) {
        throw new Error(`API请求失败，状态码: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break; 
        }
        
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // 处理可能分多次接收的SSE事件
        const events = buffer.split('\n\n');
        buffer = events.pop() || ''; // 保留未完成的部分
        
        events.forEach(event => {
          if (event.startsWith('data: ')) {
            const dataStr = event.substring(6).trim();
            if (dataStr === '[DONE]') {
              return;
            }
            try {
              const data = JSON.parse(dataStr);
              // 直接返回文本内容
              if (data.answer) {
                // 提取最终答案内容
                const finalAnswerMatch = data.answer.match(/"action":\s*"Final Answer"\s*,\s*"action_input":\s*"([^"]*)"/);
                if (finalAnswerMatch && finalAnswerMatch[1]) {
                  onDataReceived(finalAnswerMatch[1]); // 只传递action_input内容
                }
              }
            } catch (e) {
              console.warn("SSE数据解析失败:", e);
            }
          }
        });
      }

      onCompleted();

    } catch (error) {
      console.error("Dify API调用失败:", error);
      onError(error);
    }
  }
};