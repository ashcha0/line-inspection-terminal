from ultralytics import YOLO
from pathlib import Path

# --- 1. 配置你的模型和图片路径 ---
# 加载你训练好的最佳模型
model_path = Path('runs/segment/train2/weights/best.pt') # ⚠️ 记得修改这里的路径为你自己的 best.pt 路径！

# 指定你要测试的图片
image_to_test = Path('test_resource/crack2.png') # ⚠️ 指定你的测试图片路径！

# 指定保存结果的文件夹
output_dir = Path('test_results')
output_dir.mkdir(exist_ok=True) # 创建文件夹

# --- 2. 执行预测 ---
# 加载模型
model = YOLO(model_path)

# 对指定图片进行预测
# stream=True 模式更节省内存，推荐使用
results = model.predict(image_to_test, stream=True)

# --- 3. 处理并保存结果 ---
print(f"正在对图片 {image_to_test.name} 进行预测...")
for result in results:
    # 方法 A:直接显示结果图片（会在一个新窗口弹出）
    # result.show()

    # 方法 B: 将结果图片保存到文件（更常用）
    save_path = output_dir / f"result_{image_to_test.name}"
    result.save(filename=str(save_path))
    print(f"✅ 预测结果已保存到: {save_path}")

print("--- 所有图片处理完毕 ---")