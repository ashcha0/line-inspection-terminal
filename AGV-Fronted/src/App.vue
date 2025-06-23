<template>
  <div class="common-layout">
    <el-container>
      <el-header class="main-header">
        智能巡线车手持终端
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.main-header {
  background-color: #409EFF;
  color: white;
  line-height: 60px;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
}
</style>
