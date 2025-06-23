import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types/api'

const service: AxiosInstance = axios.create({
  baseURL: '/prod-api',
  timeout: 10000
})

// 响应拦截器
service.interceptors.response.use(
  /**
   * 成功的响应处理
   * response 的类型是 AxiosResponse，其 data 属性是我们自定义的 ApiResponse
   */
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data

    // 如果自定义状态码不为0，则判断为错误
    if (res.code !== 0) {
      ElMessage({
        message: res.msg || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error(res.msg || 'Error'))
    } else {
      // 成功则直接返回响应体中的 res 对象
      // 这样在具体的API调用中，.then()里拿到的就是 res
      return res
    }
  },
  /**
   * 失败的响应处理
   * @param error 错误对象，类型为 AxiosError
   */
  (error: AxiosError) => {
    console.error('Request Error: ' + error.message) // 用于调试
    ElMessage({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
