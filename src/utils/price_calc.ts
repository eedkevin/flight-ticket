export interface IPriceCalculator {
  calc(basePrice: number, capacity: number, occupied: number): number
}

function calc(basePrice: number, capacity: number, occupied: number): number {
  return basePrice * ((occupied / capacity) * 2 + 1)
}

const price: IPriceCalculator = {
  calc,
}

export default price
