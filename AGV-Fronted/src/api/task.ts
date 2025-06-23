import request from './request'
import type { TableDataInfo, ApiResponse } from '@/types/api'
import type { Task } from '@/types/models'

/**
 * 定义任务列表的查询参数类型
 */
interface TaskQueryParams {
  pageNum?: number
  pageSize?: number
  taskCode?: string
  taskStatus?: string
  creator?: string
  executor?: string
}

export function listTasks(params: TaskQueryParams): Promise<TableDataInfo<Task>> {
  return request({
    url: '/agv/task/list',
    method: 'get',
    params
  })
}

export function addTask(data: Partial<Task>): Promise<ApiResponse<Task>> {
  return request({
    url: '/agv/task',
    method: 'post',
    data
  })
}

export function updateTask(data: Task): Promise<ApiResponse<Task>> {
  return request({
    url: '/agv/task',
    method: 'put',
    data
  })
}

export function deleteTask(id: number): Promise<ApiResponse> {
  return request({
    url: `/agv/task/${id}`,
    method: 'delete'
  })
}

export function startTask(id: number): Promise<ApiResponse> {
  return request({
    url: `/agv/task/start/${id}`,
    method: 'post'
  })
}

export function endTask(id: number, isAbort: boolean): Promise<ApiResponse> {
  return request({
    url: `/agv/task/end/${id}`,
    method: 'post',
    params: { isAbort }
  })
}
