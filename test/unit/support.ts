export class MockBase {
  protected data: any[]

  constructor() {}

  setData(data: any[]) {
    this.data = data
  }

  reset() {
    this.data = []
  }

  mock(): Promise<any> {
    return new Promise((resolve) => resolve(this.data.pop()))
  }
}
