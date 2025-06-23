<template>
  <el-card class="box-card" style="max-width: 600px; margin: 50px auto">
    <template #header>
      <div class="card-header">
        <span>系统初始化自检</span>
        <el-button text @click="settingsDialogVisible = true">
          <el-icon><Setting /></el-icon>
        </el-button>
      </div>
    </template>
    <div v-for="item in checkItems" :key="item.key" class="check-item">
      <span>{{ item.label }}</span>
      <div class="status-icon">
        <el-icon v-if="item.status === 'loading'" class="is-loading"><Loading /></el-icon>
        <el-icon v-if="item.status === 'success'" color="green"><CircleCheckFilled /></el-icon>
        <el-icon v-if="item.status === 'error'" color="red"><CircleCloseFilled /></el-icon>
      </div>
    </div>
    <el-divider />
    <div style="text-align: center">
      <el-button type="primary" :disabled="!allSuccess" @click="enterSystem">进入系统</el-button>
      <el-button @click="runChecks" :loading="isChecking">重新检测</el-button>
    </div>
  </el-card>

  <SettingsView v-model="settingsDialogVisible" @saved="handleSettingsSaved" />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { checkFs, checkDb, checkAgv, checkCam } from '@/api/system'
import SettingsView from '@/components/SettingsView.vue'

type CheckStatus = 'loading' | 'success' | 'error'
interface CheckItem {
  key: string
  label: string
  status: CheckStatus
  // 使用 unknown 替代 any 来满足类型检查
  checkFunc: () => Promise<unknown>
}

const router = useRouter()
const settingsDialogVisible = ref(false)
const isChecking = ref(false)

const checkItems = ref<CheckItem[]>([
  { key: 'fs', label: '文件系统', status: 'loading', checkFunc: checkFs },
  { key: 'db', label: '数据库连接', status: 'loading', checkFunc: checkDb },
  { key: 'agv', label: 'AGV通信', status: 'loading', checkFunc: checkAgv },
  { key: 'cam', label: '摄像头连接', status: 'loading', checkFunc: checkCam }
])

const allSuccess = computed(() => checkItems.value.every((item) => item.status === 'success'))

const runChecks = async () => {
  isChecking.value = true
  checkItems.value.forEach((item) => (item.status = 'loading'))

  const promises = checkItems.value.map((item) =>
    item
      .checkFunc()
      .then(() => {
        item.status = 'success'
      })
      .catch(() => {
        item.status = 'error'
      })
  )

  await Promise.allSettled(promises)
  isChecking.value = false
}

const enterSystem = () => {
  router.push('/tasks')
}

const handleSettingsSaved = () => {
  settingsDialogVisible.value = false
  runChecks()
}

onMounted(() => {
  runChecks()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.check-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 16px;
}
</style>
