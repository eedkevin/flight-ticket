import { camelCase } from 'camel-case'
import snakecaseKeys from 'snakecase-keys'

function toCamel(object: any): any {
  return Object.entries(object).reduce((carry, [key, value]) => {
    carry[camelCase(key)] = value
    return carry
  }, {})
}

function toSnake(object: any): any {
  return snakecaseKeys(object)
}

export { toCamel, toSnake }
