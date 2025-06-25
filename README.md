# line-inspection-terminal

前端子仓库：https://github.com/ashcha0/line-inspection-terminal-frontend.git
后端子仓库：https://github.com/ashcha0/line-inspection-terminal-backend.git

项目结构

line-inspection-terminal/
├── backend/
│   └── ...
├── frontend/
│   └── ...
├── .gitignore
├── README.md
└── ...

创建如上目录并分别在前端仓库和后端仓库克隆项目
cd frontend
git init
git remote add origin https://github.com/ashcha0/line-inspection-terminal-frontend.git
git pull origin main

cd backend
git init
git pull origin main
git remote add origin https://github.com/ashcha0/line-inspection-terminal-backend.git

这样就可以在主仓库管理管理

前端（AGV-Fronted）主要依赖：
vue: ^3.4.27
vue-router: ^4.3.3
element-plus: ^2.7.5
pinia: ^2.1.7
axios: ^1.7.2
前端开发与构建工具：
vite: ^5.2.13
typescript: ~5.4.5
vue-tsc: ^2.0.19
eslint: ^8.57.0
eslint-plugin-vue: ^9.26.0
prettier: ^3.3.1
@vitejs/plugin-vue: ^5.0.5
@vue/eslint-config-prettier: ^9.0.0
@vue/eslint-config-typescript: ^13.0.0
@vue/tsconfig: ^0.5.1
@tsconfig/node22: ^22.0.1
unplugin-auto-import: ^0.17.6
unplugin-vue-components: ^0.27.0
npm-run-all2: ^6.2.0
Mock Server（agv-mock-server）依赖：
express: ^4.19.2
body-parser: ^1.20.2
cors: ^2.8.5
全局环境工具版本（通过终端命令获取）：
Node.js: v22.14.0
npm: 11.2.0