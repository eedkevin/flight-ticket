export interface Airport {
  id: number
  name: string
}

export interface Traveler {
  id: number
  name: string
}

export interface Route {
  id: number
  airports: Array<Airport>
}

export interface Flight {
  id: number
  capacity: number
  base_price: number
  route_id: number
  departure_time: Date
}

export interface Ticket {
  id: number
  ticket_no: string
  price: number
  traveler_id: number
  flight_no: string
}

export interface FlightThumb {
  id: number
  capacity: number
  remainSeats: number
  currentPrice: number
}

export interface Bill {
  id: number
  traveler_id: number
  ticket_no: string
  flight_id: number
  payment_no: string
  refund_no: string
  amount: number
  status: string
  paid_at: Date
  refund_at: Date
}

export interface RestResponse {
  status: string
  code: number
  msg: string
  data: any
}
