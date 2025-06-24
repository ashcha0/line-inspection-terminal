const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.text({ type: 'text/plain' }));

// --- In-memory Database ---
// A simple in-memory store to simulate database state.
let db = {
  config: {
    id: 1,
    host: '192.168.2.100',
    drivePort: 8080,
    analysisPort: 8081,
    cloudUrl: 'http://cloud.example.com/api',
    cam1: 'rtsp://user:pass@192.168.2.101:554/stream1',
    username1: 'admin',
    password1: '123456',
    cam2: 'rtsp://user:pass@192.168.2.102:554/stream1',
    username2: 'admin',
    password2: '123456',
    cam3: 'rtsp://user:pass@192.168.2.103:554/stream1',
    username3: 'admin',
    password3: '123456',
    cam4: 'rtsp://user:pass@192.168.2.104:554/stream1',
    username4: 'admin',
    password4: '123456',
    deleteFlag: false,
  },
  tasks: [
    { id: 101, taskCode: 'T20250621-001', taskName: '1号隧道日常巡检', startPos: 'A入口', taskTrip: '2.5km', creator: '张三', executor: '李四', execTime: '2025-06-20 14:00:00', endTime: '2025-06-20 15:30:00', createTime: '2025-06-20 13:00:00', taskStatus: '已完成', round: 1, uploaded: true, remark: '已归档', cloudTaskId: 9901, deleteFlag: false },
    { id: 102, taskCode: 'T20250621-002', taskName: '2号隧道紧急排查', startPos: 'B入口', taskTrip: '1.8km', creator: '王五', executor: '王五', execTime: '2025-06-21 09:00:00', endTime: null, taskStatus: '巡视中', round: 1, uploaded: false, remark: '收到紧急通知', cloudTaskId: null, deleteFlag: false },
    { id: 103, taskCode: 'T20250622-001', taskName: '周末隧道结构巡检', startPos: 'A入口', taskTrip: '5.0km', creator: '张三', executor: '赵六', execTime: null, endTime: null, createTime: '2025-06-21 16:00:00', taskStatus: '待巡视', round: 1, uploaded: false, remark: '', cloudTaskId: null, deleteFlag: false },
    { id: 104, taskCode: 'T20250620-003', taskName: '1号隧道夜间复检', startPos: 'A入口', taskTrip: '2.5km', creator: '李四', executor: '李四', execTime: '2025-06-20 22:00:00', endTime: '2025-06-20 23:30:00', createTime: '2025-06-20 21:00:00', taskStatus: '待上传', round: 1, uploaded: false, remark: '复检完成，等待数据上传', cloudTaskId: 9801, deleteFlag: false },
  ],
  flaws: [
    { id: 1, taskId: 101, round: 1, flawType: '裂缝', flawName: '隧道壁裂缝', flawDesc: '侧壁发现30cm长裂缝', flawDistance: 120.5, flawImage: '/images/flaw01.jpg', flawImageUrl: 'https://placehold.co/600x400/cccccc/000000?text=Flaw-Image-1', confirmed: true, createTime: '2025-06-20 14:15:20', level: '一般', remark: '已上报维修' },
    { id: 2, taskId: 102, round: 1, flawType: '渗水', flawName: '顶部渗水', flawDesc: '隧道顶部出现滴水现象', flawDistance: 850.2, flawImage: '/images/flaw02.jpg', flawImageUrl: 'https://placehold.co/600x400/cccccc/000000?text=Flaw-Image-2', confirmed: false, createTime: '2025-06-21 09:30:10', level: '严重', remark: '' },
    { id: 3, taskId: 104, round: 1, flawType: '异物', flawName: '轨道异物', flawDesc: '轨道内发现金属碎片', flawDistance: 1500.0, flawImage: '/images/flaw03.jpg', flawImageUrl: 'https://placehold.co/600x400/cccccc/000000?text=Flaw-Image-3', confirmed: false, createTime: '2025-06-20 22:45:00', level: '紧急', remark: '' },
  ],
  agvStatus: {
    sysTime: new Date().toISOString(),
    isRunning: false,
    currentPosition: 0.0,
    direction: 'forward' // 新增方向状态：'forward' 或 'backward'
  }
};

let taskIdCounter = 105;
let flawIdCounter = 4;

// --- Helper Functions ---
const createSuccessResponse = (data) => ({ code: 0, msg: '操作成功', data });
const createErrorResponse = (msg, code = 500) => ({ code, msg, data: null });
const createPageInfo = (rows, total) => ({ code: 0, msg: '查询成功', rows, total });

// --- Routers ---
const apiRouter = express.Router();
const webrtcRouter = express.Router();

app.use('/prod-api', apiRouter);
app.use('/webrtc-api', webrtcRouter);

// ===================================
// 1. 系统配置相关接口 (/agv/config)
// ===================================
apiRouter.get('/agv/config', (req, res) => {
  console.log('GET /agv/config -> 获取系统配置');
  res.json(createSuccessResponse(db.config));
});

apiRouter.put('/agv/config', (req, res) => {
  console.log('PUT /agv/config -> 更新系统配置', req.body);
  db.config = { ...db.config, ...req.body };
  res.json(createSuccessResponse(db.config));
});

// ===================================
// 2. 故障缺陷管理相关接口 (/agv/flaw)
// ===================================
apiRouter.get('/agv/flaw/list', (req, res) => {
    const taskId = req.query.taskId;
    console.log(`GET /agv/flaw/list -> 获取任务 ${taskId} 的缺陷列表`);
    if (!taskId) {
        return res.status(400).json(createErrorResponse('缺少taskId参数'));
    }
    const flaws = db.flaws.filter(f => f.taskId == taskId);
    res.json(createPageInfo(flaws, flaws.length));
});

apiRouter.get('/agv/flaw/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    console.log(`GET /agv/flaw/${id} -> 获取缺陷详情`);
    const flaw = db.flaws.find(f => f.id === id);
    if (flaw) {
        res.json(createSuccessResponse(flaw));
    } else {
        res.status(404).json(createErrorResponse('未找到缺陷'));
    }
});

apiRouter.post('/agv/flaw', (req, res) => {
    const flawData = req.body;
    console.log(`POST /agv/flaw -> 新增缺陷`, flawData);
    const newFlaw = { ...flawData, id: flawIdCounter++, createTime: new Date().toISOString() };
    db.flaws.push(newFlaw);
    res.json(createSuccessResponse(newFlaw));
});

apiRouter.put('/agv/flaw', (req, res) => {
    const flawData = req.body;
    console.log(`PUT /agv/flaw -> 更新缺陷 ${flawData.id}`, flawData);
    const index = db.flaws.findIndex(f => f.id === flawData.id);
    if (index !== -1) {
        db.flaws[index] = { ...db.flaws[index], ...flawData };
        res.json(createSuccessResponse(db.flaws[index]));
    } else {
        res.status(404).json(createErrorResponse('未找到缺陷'));
    }
});

apiRouter.delete('/agv/flaw/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    console.log(`DELETE /agv/flaw/${id} -> 删除缺陷`);
    const index = db.flaws.findIndex(f => f.id === id);
    if (index !== -1) {
        db.flaws.splice(index, 1);
        res.json(createSuccessResponse(null));
    } else {
        res.status(404).json(createErrorResponse('未找到缺陷'));
    }
});

apiRouter.get('/agv/flaw/live/:id', (req, res) => {
    // 模拟实时发现新缺陷
    if (Math.random() > 0.7) {
        const flawId = flawIdCounter++;
        const newFlaw = {
            id: flawId,
            taskId: parseInt(req.params.id, 10),
            round: 1,
            flawType: '异物',
            flawName: '实时发现-轨道异物',
            flawDesc: '轨道内发现新的金属碎片',
            flawDistance: parseFloat((db.agvStatus.currentPosition + Math.random() * 10).toFixed(2)),
            flawImage: `/images/flaw${flawId}.jpg`,
            flawImageUrl: `https://placehold.co/600x400/cccccc/000000?text=Live-Flaw-${flawId}`,
            confirmed: false,
            createTime: new Date().toISOString(),
            level: '紧急',
            remark: ''
        };
        db.flaws.push(newFlaw);
        console.log(`GET /agv/flaw/live/${req.params.id} -> 发现新缺陷`, newFlaw);
        res.json(createSuccessResponse([newFlaw]));
    } else {
        console.log(`GET /agv/flaw/live/${req.params.id} -> 无新缺陷`);
        res.json(createSuccessResponse([]));
    }
});

apiRouter.get('/agv/flaw/check/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10);
    console.log(`GET /agv/flaw/check/${taskId} -> 检查缺陷确认状态`);
    const taskFlaws = db.flaws.filter(f => f.taskId === taskId);
    const allConfirmed = taskFlaws.length > 0 && taskFlaws.every(f => f.confirmed);
    res.json(createSuccessResponse(allConfirmed));
});

// ===================================
// 3. AGV移动控制相关接口 (/agv/movement)
// ===================================
apiRouter.get('/agv/movement/heartbeat', (req, res) => {
    db.agvStatus.sysTime = new Date().toISOString();
    if (db.agvStatus.isRunning) {
        // 根据方向决定距离变化
        if (db.agvStatus.direction === 'forward') {
            db.agvStatus.currentPosition += 5.5; // 前进时增加距离
        } else if (db.agvStatus.direction === 'backward') {
            db.agvStatus.currentPosition -= 5.5; // 后退时减少距离
            // 确保距离不会变成负数
            if (db.agvStatus.currentPosition < 0) {
                db.agvStatus.currentPosition = 0;
            }
        }
    }
    console.log(`GET /agv/movement/heartbeat -> AGV状态`, db.agvStatus);
    res.json(createSuccessResponse(db.agvStatus));
});

apiRouter.post('/agv/movement/:action', (req, res) => {
    const action = req.params.action;
    console.log(`POST /agv/movement/${action} -> 控制AGV`);
    switch(action) {
        case 'forward':
            db.agvStatus.isRunning = true;
            db.agvStatus.direction = 'forward';
            break;
        case 'stop':
            db.agvStatus.isRunning = false;
            break;
        case 'backward':
            db.agvStatus.isRunning = true;
            db.agvStatus.direction = 'backward';
            break;
    }
    res.json(createSuccessResponse(`AGV ${action} command received`));
});

// ===================================
// 4. 系统检查相关接口 (/system/check)
// ===================================
const checkEndpoints = ['fs', 'db', 'agv', 'cam'];
checkEndpoints.forEach(ep => {
  apiRouter.get(`/system/check/${ep}`, (req, res) => {
    console.log(`GET /system/check/${ep} -> 正在检查 ${ep}`);
    // 模拟网络延迟和可能的失败
    const delay = 500 + Math.random() * 1000;
    const isSuccess = Math.random() > 0.1; // 90% 成功率
    setTimeout(() => {
      if (isSuccess) {
        res.json(createSuccessResponse(`${ep} check passed.`));
      } else {
        res.status(500).json(createErrorResponse(`${ep} check failed.`));
      }
    }, delay);
  });
});

// ===================================
// 5. 巡视任务管理相关接口 (/agv/task)
// ===================================
apiRouter.get('/agv/task/list', (req, res) => {
    console.log('GET /agv/task/list -> 查询任务列表', req.query);
    const { pageNum = 1, pageSize = 10, taskCode, creator, executor, taskStatus } = req.query;
    let filteredTasks = db.tasks;

    if (taskCode) filteredTasks = filteredTasks.filter(t => t.taskCode.includes(taskCode));
    if (creator) filteredTasks = filteredTasks.filter(t => t.creator.includes(creator));
    if (executor) filteredTasks = filteredTasks.filter(t => t.executor.includes(executor));
    if (taskStatus) filteredTasks = filteredTasks.filter(t => t.taskStatus === taskStatus);

    const total = filteredTasks.length;
    const start = (pageNum - 1) * pageSize;
    const end = start + parseInt(pageSize, 10);
    const paginatedTasks = filteredTasks.slice(start, end);

    res.json(createPageInfo(paginatedTasks, total));
});

apiRouter.get('/agv/task/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    console.log(`GET /agv/task/${id} -> 获取任务详情`);
    const task = db.tasks.find(t => t.id === id);
    if (task) {
        res.json(createSuccessResponse(task));
    } else {
        res.status(404).json(createErrorResponse('未找到任务'));
    }
});

apiRouter.post('/agv/task', (req, res) => {
    const newTask = { ...req.body, id: taskIdCounter++, createTime: new Date().toISOString(), taskStatus: '待巡视' };
    console.log('POST /agv/task -> 新建任务', newTask);
    db.tasks.unshift(newTask);
    res.json(createSuccessResponse(newTask));
});

apiRouter.put('/agv/task', (req, res) => {
    const taskData = req.body;
    console.log(`PUT /agv/task -> 更新任务 ${taskData.id}`, taskData);
    const index = db.tasks.findIndex(t => t.id === taskData.id);
    if (index !== -1) {
        db.tasks[index] = { ...db.tasks[index], ...taskData };
        res.json(createSuccessResponse(db.tasks[index]));
    } else {
        res.status(404).json(createErrorResponse('未找到任务'));
    }
});

apiRouter.delete('/agv/task/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    console.log(`DELETE /agv/task/${id} -> 删除任务`);
    db.tasks = db.tasks.filter(t => t.id !== id);
    res.json(createSuccessResponse(null));
});


apiRouter.post('/agv/task/start/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    console.log(`POST /agv/task/start/${id} -> 启动任务`);
    const task = db.tasks.find(t => t.id === id);
    if (task) {
        task.taskStatus = '巡视中';
        task.execTime = new Date().toISOString();
        db.agvStatus.isRunning = true;
        db.agvStatus.currentPosition = 0;
        db.agvStatus.direction = 'forward'; // 任务开始时默认为前进方向
        res.json(createSuccessResponse(null));
    } else {
        res.status(404).json(createErrorResponse('未找到任务'));
    }
});

apiRouter.post('/agv/task/end/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const isAbort = req.query.isAbort === 'true';
    console.log(`POST /agv/task/end/${id} -> 结束任务 (中止: ${isAbort})`);
    const task = db.tasks.find(t => t.id === id);
    if (task) {
        task.taskStatus = isAbort ? '待巡视' : '待上传';
        task.endTime = new Date().toISOString();
        db.agvStatus.isRunning = false;
        res.json(createSuccessResponse(null));
    } else {
        res.status(404).json(createErrorResponse('未找到任务'));
    }
});

apiRouter.get('/agv/task/preupload/:id', (req, res) => {
    console.log(`GET /agv/task/preupload/${id} -> 查询待上传数据`);
    const dataToUpload = [
        { info: '任务信息.json', type: '任务', status: '待上传' },
        { info: '故障列表.json', type: '故障', status: '待上传' },
        { info: 'flaw03.jpg', type: '图片', status: '待上传' },
    ];
    res.json(createSuccessResponse(dataToUpload));
});

apiRouter.post('/agv/task/upload/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    console.log(`POST /agv/task/upload/${id} -> 上传任务数据`);
    const task = db.tasks.find(t => t.id === id);
    // 模拟上传过程
    setTimeout(() => {
        if (task) {
            task.taskStatus = '已完成';
            task.uploaded = true;
            console.log(`任务 ${id} 上传完成`);
        }
    }, 2000);
    res.json(createSuccessResponse('Upload started.'));
});

// ===================================
// 6. 流媒体取流相关 (WebRTC)
// ===================================
webrtcRouter.post('/index/api/webrtc', (req, res) => {
    console.log('POST /webrtc-api/index/api/webrtc -> 收到WebRTC信令');
    console.log('Query:', req.query);
    console.log('Body (Offer SDP):', req.body);
    
    // 这是模拟的Answer SDP，实际应由流媒体服务器生成
    const answerSdp = `v=0
o=- 4142823199214482656 2 IN IP4 127.0.0.1
s=-
t=0 0
a=msid-semantic: WMS
... (此处省略了完整的SDP内容)
a=ssrc:12345 cname:mock-stream`;

    res.json(createSuccessResponse({
        sdp: answerSdp,
        sessionid: "mocksession" + Date.now()
    }));
});


// Start server
app.listen(PORT, () => {
  console.log(`
  ================================================
  智能巡线车 - 模拟服务器已启动
  运行在: http://localhost:${PORT}

  前端开发服务器(Vite)配置的代理将会把 /prod-api 
  和 /webrtc-api 的请求转发到这里。
  ================================================
  `);
});
