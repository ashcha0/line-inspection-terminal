import request from './request'
import type { ApiResponse } from '@/types/api'

export function getHeartbeat(): Promise<ApiResponse> { return request({ url: '/agv/movement/heartbeat', method: 'get' }) }
export function agvForward(): Promise<ApiResponse> { return request({ url: '/agv/movement/forward', method: 'post' }) }
export function agvStop(): Promise<ApiResponse> { return request({ url: '/agv/movement/stop', method: 'post' }) }
export function agvBackward(): Promise<ApiResponse> { return request({ url: '/agv/movement/backward', method: 'post' }) }
