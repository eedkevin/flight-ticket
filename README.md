# Flight Ticket

## Prerequisite
1. docker
2. docker-compose v3
3. GNU-Make 3.81

## Getting Started
1. 启动服务

```sh
make build-up
```

2. 调试接口

请用Postman导入collection文件 `./flight_ticket.postman_collection.json` 进行调试

3. 航班实时查询接口请用 graphql playground 进行调试。浏览器打开

```sh
open http://localhost:3000/api/graphql
```

```graphql
subscription {
  getFlightThumbInstant{
    id
    capacity
    remainSeats
    currentPrice
  }
}
```

4. Redis调试

启动时附带了一个 redis 管理界面，可用于调试。浏览器打开

```sh
open http://localhost:8081
```

5. DB调试

可用任何 postgres 客户端连接 `localhost:5432` 进行调试。默认用户名/密码 `root/root` , 数据库名 `flight_ticket` 

## Test & Coverage

本地执行测试用例需要先安装依赖

```sh
yarn install
```

### Unit Test

```sh
yarn test:unit
```

### E2E Test

```sh
yarn test:e2e
```

### Stress/Performance Test

```sh
yarn test:stress
```

### Test Coverage

```sh
yarn test:coverage
```

### 补充

1. 系统做了一些简化，例如航司系统和支付接口是在系统内做了mock，并未实际发出http请求；数据在启动阶段初始化，没有设计新增航班和用户注册接口

2. 系统做了一个危险的假设：系统依赖的中间件和系统运行环境高可用。即系统对容灾和恢复没有做充分的考虑

3. 由于航班、机票等数据是在启动是初始化的，如果因反复调试接口或运行压力测试导致无可用航班余位，请运行 seed 脚本重新导入数据
```sh
yarn seed
```

4. 如有系统启动或其他问题，请随时联系
