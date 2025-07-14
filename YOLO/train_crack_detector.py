from ultralytics import YOLO

def main():
    # 1. 加载模型
    # 我们从一个在大型数据集上预训练过的 'yolov8n-seg.pt' 模型开始。
    # 'n' 代表 nano，是 YOLOv8 系列中最小最快的模型，非常适合初次尝试。
    # '-seg' 后缀表示这是一个分割模型。
    model = YOLO('yolov8m-seg.pt')

    # 2. 开始训练
    # 我们告诉模型使用 'crack-seg.yaml' 这个数据集配置文件。
    # 因为这个数据集是 Ultralytics 的官方数据集之一，所以当你指定它时，
    # YOLO 会自动从网上下载并准备好它，非常方便。
    #
    # 参数解释:
    #   data='crack-seg.yaml': 指定数据集。
    #   epochs=50:            训练的总轮数。模型会完整地学习50遍整个数据集。对于初次尝试，50轮足够看到不错的效果。
    #   imgsz=640:            训练时，图片会被缩放到 640x640 的尺寸。
    #   device=0:             明确指定使用 ID 为 0 的 GPU (也就是你的 4060)。
    print("--- 开始使用 YOLOv8-Medium 模型进行深度训练 ---")
    print("--- 开始训练裂缝检测模型 ---")
    results = model.train(data='crack-seg.yaml',
                          epochs=300,
                          imgsz=640,
                          device=0,
                          batch=-1)

    print("--- 训练完成！---")
    print(f"效果最好的模型权重保存在: {results.save_dir}/weights/best.pt")

if __name__ == '__main__':
    main()