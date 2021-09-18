import { RestResponse } from '../types'
import { getStatus, getMsg } from '../constants'
import { toSnake } from './strings'

export function genRespBody(code: number, data = {}): RestResponse {
  const body: RestResponse = {
    code: code,
    status: getStatus(code),
    msg: getMsg(code),
    data: toSnake(data),
  }
  return body
}
