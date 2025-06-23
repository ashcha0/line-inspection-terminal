/**
 * 定义通用的API返回结构。
 * 使用 unknown 作为默认类型，替代不安全的 any。
 */
export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 定义分页查询的返回结构。
 * 使用 unknown 作为默认类型。
 */
export interface TableDataInfo<T = unknown> {
  code: number;
  msg: string;
  rows: T[];
  total: number;
}
