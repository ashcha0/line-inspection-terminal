export interface Task {
  id?: number;
  taskCode: string;
  taskName: string;
  startPos?: string;
  taskTrip?: string;
  creator?: string;
  executor?: string;
  execTime?: string | null;
  endTime?: string | null;
  createTime?: string;
  taskStatus: '待巡视' | '巡视中' | '待上传' | '已完成';
  // ... 其他字段
}

export interface Flaw {
  id: number;
  taskId: number;
  flawName: string;
  flawImageUrl: string;
  level: string;
  confirmed: boolean;
  flawDistance?: number;
  flawType?: string;
  flawDesc?: string;
  remark?: string;
}

export interface SystemConfig {
    id: number;
    host: string;
    drivePort: number;
    cam1: string;
    cam2: string;
    cam3: string;
    cam4: string;
    // ... 其他配置
}
