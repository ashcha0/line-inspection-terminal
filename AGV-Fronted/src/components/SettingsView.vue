<template>
  <el-dialog
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    title="系统设置"
    width="600px"
    @open="loadConfig"
  >
    <el-form v-if="config" :model="config" label-width="120px">
      <el-divider>AGV主机配置</el-divider>
      <el-form-item label="主机IP">
        <el-input v-model="config.host"></el-input>
      </el-form-item>
      <el-form-item label="驱动端口">
        <el-input v-model.number="config.drivePort"></el-input>
      </el-form-item>

      <el-divider>摄像头配置</el-divider>
      <div v-for="i in 4" :key="i">
        <el-form-item :label="`摄像头 ${i} 地址`">
            <el-input v-model="config[`cam${i}`]"></el-input>
        </el-form-item>
      </div>
    </el-form>
    <el-skeleton v-else :rows="5" animated />
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" @click="saveConfig">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getConfig, updateConfig } from '@/api/system';
import { ElMessage } from 'element-plus';
import type { SystemConfig } from '@/types/models';

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'saved'): void;
}>();

const config = ref<SystemConfig | null>(null);

const loadConfig = async () => {
  config.value = null; // reset for loading state
  const res = await getConfig();
  config.value = res.data;
};

const saveConfig = async () => {
  if (!config.value) return;
  await updateConfig(config.value);
  ElMessage.success('配置已保存');
  emit('saved');
};
</script>
