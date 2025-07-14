import cv2
import base64
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from ultralytics import YOLO
import logging
import json

# --- 配置 ---
logging.basicConfig(level=logging.INFO)
# 定义一个比例尺：假设视频帧的宽度（例如640px）代表现实中的1.5米
# 你可以根据实际情况调整这个值
PIXELS_PER_METER = 640 / 1.5

# --- 初始化 FastAPI 应用 ---
app = FastAPI(title="Real-time Crack Detection Service with Tracking and Analysis")

# --- 状态管理 ---
# 这个集合用于存储已经捕获并发送过的裂缝追踪ID，以实现去重
CAPTURED_CRACK_IDS = set()

# --- 模型加载 ---
# 在服务启动时预先加载模型，避免每次请求时重复加载
try:
    # ⚠️ 请务必修改为你的 best.pt 模型路径!
    model = YOLO('runs/segment/train2/weights/best.pt')
    logging.info("✅ YOLOv8 模型加载成功!")
except Exception as e:
    logging.error(f"❌ 模型加载失败: {e}")
    model = None

@app.get("/")
def read_root():
    """根路径，用于检查服务状态。"""
    return {"status": "AI Service is running", "model_loaded": model is not None}

@app.post("/reset")
def reset_tracker():
    """提供一个HTTP端点来重置追踪器状态，方便调试。"""
    global CAPTURED_CRACK_IDS
    CAPTURED_CRACK_IDS.clear()
    logging.info("追踪器状态已重置。")
    return {"status": "Tracker reset successfully"}

@app.websocket("/ws/detect")
async def websocket_endpoint(websocket: WebSocket):
    """通过 WebSocket 接收视频帧, 进行裂缝追踪, 并将结果实时发回前端。"""
    await websocket.accept()
    logging.info("WebSocket 连接已建立。")
    if not model:
        await websocket.close(code=1011, reason="模型未成功加载，无法提供服务。")
        logging.warning("由于模型未加载，已断开 WebSocket 连接。")
        return

    try:
        while True:
            base64_string = await websocket.receive_text()
            try:
                # 检查数据格式是否符合Base64编码的图片
                if ',' in base64_string:
                    img_data = base64.b64decode(base64_string.split(',')[1])
                else:
                    # 尝试直接解码整个字符串
                    img_data = base64.b64decode(base64_string)
                np_arr = np.frombuffer(img_data, np.uint8)
                frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
                
                if frame is None:
                    logging.warning("无法解码图像帧")
                    continue
                    
            except Exception as e:
                logging.error(f"解码图像失败: {str(e)}")
                continue # 解码失败则跳过此帧

            # 运行YOLOv8模型检测
            results = model.track(frame, persist=True, verbose=False)
            
            # 只发送新捕获的缺陷给前端 (符合前端期望的格式)
            detected_flaws = []
            
            if results[0].boxes and results[0].boxes.id is not None and results[0].masks:
                for i, box in enumerate(results[0].boxes):
                    track_id = int(box.id[0])
                    
                    # 只处理新的裂缝ID (尚未发送过的)
                    if track_id not in CAPTURED_CRACK_IDS:
                        CAPTURED_CRACK_IDS.add(track_id)
                        logging.info(f"发现新裂缝，ID: {track_id}。正在分析并打包数据发送至前端...")

                        # 量化分析
                        contour = results[0].masks.xy[i]
                        contour_np = np.array(contour, dtype=np.int32)
                        pixel_area = cv2.contourArea(contour_np)
                        scaled_area = pixel_area / (PIXELS_PER_METER ** 2)
                        rect = cv2.minAreaRect(contour_np)
                        (w, h) = rect[1]
                        pixel_length = max(w, h)
                        scaled_length = pixel_length / PIXELS_PER_METER

                        if scaled_length > 0.5: level = "高"
                        elif scaled_length > 0.2: level = "中"
                        else: level = "低"

                        x1, y1, x2, y2 = [int(coord) for coord in box.xyxy[0]]
                        box_w, box_h = x2 - x1, y2 - y1
                        flaw_desc = "检测到表面裂缝"
                        if box_h > box_w * 1.5: flaw_desc = "检测到表面纵向裂缝"
                        elif box_w > box_h * 1.5: flaw_desc = "检测到表面横向裂缝"

                        # 准备裂缝图像
                        try:
                            # 确保裁剪坐标不超出图像边界
                            y1, y2 = max(0, y1), min(frame.shape[0], y2)
                            x1, x2 = max(0, x1), min(frame.shape[1], x2)
                            
                            if y2 > y1 and x2 > x1:  # 确保有效的裁剪区域
                                cropped_crack_img = frame[y1:y2, x1:x2]
                                _, buffer = cv2.imencode('.jpg', cropped_crack_img)
                                img_base64 = base64.b64encode(buffer).decode('utf-8')
                            else:
                                # 如果裁剪区域无效，使用整个图像
                                _, buffer = cv2.imencode('.jpg', frame)
                                img_base64 = base64.b64encode(buffer).decode('utf-8')
                        except Exception as e:
                            logging.error(f"裁剪图像失败: {str(e)}")
                            # 如果裁剪失败，使用整个图像
                            _, buffer = cv2.imencode('.jpg', frame)
                            img_base64 = base64.b64encode(buffer).decode('utf-8')

                        # 构建完全符合前端期望的缺陷对象
                        flaw = {
                            "flawType": "裂缝",
                            "flawName": "混凝土表面裂缝",
                            "level": level,
                            "flawLength": round(scaled_length, 3),
                            "flawArea": round(scaled_area, 4),
                            "countNum": 1,
                            "flawImageUrl": f"data:image/jpeg;base64,{img_base64}",
                            "flawDesc": f"{flaw_desc}，长度约{round(scaled_length, 2)}米",
                            "remark": f"置信度: {float(box.conf[0]):.0%}, YOLOv8检测"
                        }
                        
                        detected_flaws.append(flaw)
            
            # 只有当有新的缺陷时才发送数据
            if detected_flaws:
                logging.info(f"发送 {len(detected_flaws)} 个新缺陷到前端")
                # 直接发送缺陷数组，符合前端期望格式
                await websocket.send_text(json.dumps(detected_flaws))

    except WebSocketDisconnect:
        logging.info("WebSocket 连接已由客户端断开。")
    except Exception as e:
        logging.error(f"WebSocket 连接中发生未知错误: {e}")
        await websocket.close(code=1011)
        # 在终端运行: uvicorn main:app --host 0.0.0.0 --port 8000 --reload