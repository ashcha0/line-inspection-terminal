<template>
  <div>
    <el-page-header @back="goBack" :content="`任务详情`" />
    <el-row :gutter="20" style="margin-top:20px;">
      <el-col :span="16">
        <el-card>
          <template #header>当前缺陷图片</template>
          <el-image :src="currentFlaw.flawImageUrl" fit="contain" style="width: 100%; height: 500px; background: #f5f7fa; display:flex; justify-content:center; align-items:center;">
             <template #error> <div class="image-slot">加载失败</div> </template>
          </el-image>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>缺陷列表</template>
          <el-table :data="flawList" @row-click="handleFlawSelect" highlight-current-row height="500">
            <el-table-column prop="flawName" label="缺陷名称" />
            <el-table-column prop="level" label="等级" />
            <el-table-column prop="confirmed" label="状态">
              <template #default="scope"> {{ scope.row.confirmed ? '已确认' : '未确认' }} </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    <el-card style="margin-top:20px;">
      <template #header>缺陷详情与确认</template>
      <div v-if="currentFlaw.id">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="缺陷名称">{{ currentFlaw.flawName }}</el-descriptions-item>
          <el-descriptions-item label="缺陷类型">{{ currentFlaw.flawType }}</el-descriptions-item>
          <el-descriptions-item label="巡检距离">{{ currentFlaw.flawDistance }}m</el-descriptions-item>
          <el-descriptions-item label="缺陷等级">{{ currentFlaw.level }}</el-descriptions-item>
          <el-descriptions-item label="缺陷描述" :span="2">{{ currentFlaw.flawDesc }}</el-descriptions-item>
        </el-descriptions>
        <div style="margin-top: 20px;">
          <el-form-item label="是否确认属实">
            <el-radio-group v-model="currentFlaw.confirmed">
              <el-radio :value="true">属实</el-radio>
              <el-radio :value="false">误报/不确认</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="补充说明">
            <el-input v-model="currentFlaw.remark" type="textarea" />
          </el-form-item>
          <el-button type="primary" @click="saveFlawConfirmation">保存确认</el-button>
        </div>
      </div>
      <el-empty v-else description="请从右侧列表选择一个缺陷" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { listFlaws, updateFlaw } from '@/api/flaw';
import { ElMessage } from 'element-plus';
import type { Flaw } from '@/types/models';

const route = useRoute();
const router = useRouter();
const taskId = route.params.id as string;

const flawList = ref<Flaw[]>([]);
const currentFlaw = ref<Partial<Flaw>>({});

const goBack = () => router.back();

const getFlaws = async () => {
    const res = await listFlaws(taskId);
    flawList.value = res.rows;
    if (flawList.value.length > 0) {
        currentFlaw.value = { ...flawList.value[0] };
    }
};

const handleFlawSelect = (row: Flaw) => {
    currentFlaw.value = { ...row };
};

const saveFlawConfirmation = async () => {
    if (!currentFlaw.value.id) {
        ElMessage.warning('请先选择一个缺陷');
        return;
    }
    await updateFlaw(currentFlaw.value as Flaw);
    ElMessage.success('缺陷状态保存成功');
    const index = flawList.value.findIndex(f => f.id === currentFlaw.value.id);
    if (index !== -1) {
        flawList.value[index] = { ...currentFlaw.value } as Flaw;
    }
};

onMounted(getFlaws);
</script>
