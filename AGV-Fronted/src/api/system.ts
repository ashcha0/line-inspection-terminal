import request from './request'
import type { ApiResponse } from '@/types/api'
import type { SystemConfig } from '@/types/models'

export function checkFs(): Promise<ApiResponse> { return request({ url: '/system/check/fs', method: 'get' }) }
export function checkDb(): Promise<ApiResponse> { return request({ url: '/system/check/db', method: 'get' }) }
export function checkAgv(): Promise<ApiResponse> { return request({ url: '/system/check/agv', method: 'get' }) }
export function checkCam(): Promise<ApiResponse> { return request({ url: '/system/check/cam', method: 'get' }) }
export function getConfig(): Promise<ApiResponse<SystemConfig>> { return request({ url: '/agv/config', method: 'get' }) }
export function updateConfig(data: SystemConfig): Promise<ApiResponse<SystemConfig>> { return request({ url: '/agv/config', method: 'put', data }) }
