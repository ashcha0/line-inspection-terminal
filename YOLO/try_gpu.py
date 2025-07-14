import torch
import sys

print(f"--- Python 和 PyTorch 版本 ---")
print(f"Python 版本: {sys.version}")
print(f"PyTorch 版本: {torch.__version__}")
print("\n--- GPU 支持检查 ---")

# 检查 CUDA 是否可用
is_available = torch.cuda.is_available()

if is_available:
    print("✅ 恭喜！你的 GPU 已被 PyTorch 正确识别。")
    # 获取 GPU 数量
    device_count = torch.cuda.device_count()
    print(f"发现 {device_count} 个可用的 GPU。")
    # 获取当前 GPU 的名称
    current_device = torch.cuda.current_device()
    device_name = torch.cuda.get_device_name(current_device)
    print(f"当前使用的 GPU: ID {current_device}, 名称: {device_name}")
    # 获取 PyTorch 编译时使用的 CUDA 版本
    cuda_version = torch.version.cuda
    print(f"PyTorch 是用 CUDA {cuda_version} 版本编译的。")
else:
    print("❌ 注意：PyTorch 未能找到可用的 GPU。")
    print("这可能是因为：")
    print("1. 您安装了 CPU 版本的 PyTorch。")
    print("2. NVIDIA 驱动程序或 CUDA Toolkit 未正确安装。")
    print("后续的训练将在 CPU 上进行，速度会非常慢。")

print("\n--- 检查完成 ---")