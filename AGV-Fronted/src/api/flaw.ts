// 文件名: /src/api/flaw.ts
import request from './request'
import type { TableDataInfo, ApiResponse } from '@/types/api'
import type { Flaw } from '@/types/models.ts'

export function listFlaws(taskId: string): Promise<TableDataInfo<Flaw>> { return request({ url: '/agv/flaw/list', method: 'get', params: { taskId } }) }
export function updateFlaw(data: Flaw): Promise<ApiResponse<Flaw>> { return request({ url: '/agv/flaw', method: 'put', data }) }
export function getLiveInfo(taskId: string): Promise<ApiResponse<Flaw[]>> { return request({ url: `/agv/flaw/live/${taskId}`, method: 'get' }) }
