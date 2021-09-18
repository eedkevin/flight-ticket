import 'dotenv/config'
import { expect } from 'chai'

import { FlightDomain } from '../../../../src/domains/flight'
import { Flight } from '../../../../src/types'
import { price } from '../../../../src/utils/'

import { RedisFlightMock } from './redis_mock'
import mockdata from './flight.fixture.json'

describe('Flight Domain', () => {
  describe('#listFlightThumbs()', () => {
    const redismock = new RedisFlightMock()
    const flightDomain = new FlightDomain(redismock)

    const { flights, threadPoolForCalc } = mockdata.listFlightThumbs
    redismock.setData([flights, threadPoolForCalc])

    let actual
    it('should return a list of FlightThumbs', async () => {
      actual = await flightDomain.listFlightThumbs()

      expect(actual).to.be.an('array').that.is.not.empty
      actual.forEach((val) => {
        expect(val).to.have.property('id')
        expect(val).to.have.property('capacity')
        expect(val).to.have.property('remainSeats')
        expect(val).to.have.property('currentPrice')
      })
    })

    it('should return the correct calculation on currentPrice and remainSeats', () => {
      actual.forEach((val) => {
        for (let i = 0; i < (flights as Flight[]).length; i++) {
          if (val.id === flights[i].id) {
            const remains = threadPoolForCalc[val.id]
            const occupied = flights[i].capacity - remains
            const currentPrice = price.calc(flights[i].base_price, flights[i].capacity, occupied)
            expect(val.currentPrice).to.be.eql(currentPrice)
          }
        }
      })
    })
  })

  describe('#getFlightThumb(number)', () => {
    const redismock = new RedisFlightMock()
    const flightDomain = new FlightDomain(redismock)

    const { flight, numOfRemainSeats } = mockdata.getFlightThumb
    redismock.setData([numOfRemainSeats, flight])

    let actual
    it('should return a JSON object of FlightThumb', async () => {
      actual = await flightDomain.getFlightThumb(flight.id)

      expect(actual).not.to.be.empty
      expect(actual).to.have.property('id')
      expect(actual).to.have.property('capacity')
      expect(actual).to.have.property('remainSeats')
      expect(actual).to.have.property('currentPrice')
    })

    it('should return the correct calculation on currentPrice and remainSeats', () => {
      const occupied = flight.capacity - numOfRemainSeats
      const currentPrice = price.calc(flight.base_price, flight.capacity, occupied)
      expect(actual.currentPrice).to.be.eql(currentPrice)
    })
  })
})
