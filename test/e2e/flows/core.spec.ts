import 'dotenv/config'
import request from 'supertest'
import { expect } from 'chai'
import StatusCodes from 'http-status-codes'

import fixtures from './core.fixture.json'

const HOST = process.env.HOST || 'localhost'
const PORT = process.env.PORT || '3000'
let api

before(() => {
  api = request(`${HOST}:${PORT}/api`)
})

describe('Core Flows #1 book->pay->cancel', () => {
  let auth
  let order
  before(() => {
    order = fixtures[0].input
    auth = fixtures[0].header.authorization
  })

  describe('POST /api/rest/ticket/book', () => {
    let resp
    it('should return http status code 200', async () => {
      resp = await api
        .post('/rest/ticket/book')
        .set('Authorization', auth)
        .query({ flight_id: order.flight_id, traveler_id: order.traveler_id })
      expect(resp.statusCode).to.eql(StatusCodes.OK)
    })
    it('should return a valid IRestResponse JSON obejct', () => {
      const { body } = resp
      expect(body).to.not.eql({})
      expect(body).to.have.property('status')
      expect(body).to.have.property('code')
      expect(body).to.have.property('msg')
      expect(body).to.have.property('data')
    })
    it('should return a JSON object with ticket_no and ticket_price', () => {
      const { data } = resp.body
      expect(data).to.have.property('ticket_no')
      expect(data).to.have.property('ticket_price')
      order.ticket_no = data.ticket_no
      order.ticket_price = data.ticket_price
    })
  })

  describe('POST /api/rest/ticket/pay', async () => {
    let resp
    it('should return http status code 200', async () => {
      resp = await api
        .post('/rest/ticket/pay')
        .set('Authorization', auth)
        .query({ ticket_no: order.ticket_no, flight_id: order.flight_id, traveler_id: order.traveler_id })
      expect(resp.statusCode).to.eql(StatusCodes.OK)
    })
    it('should return a valid IRestResponse JSON object', () => {
      const { body } = resp
      expect(body).to.not.eql({})
      expect(body).to.have.property('status')
      expect(body).to.have.property('code')
      expect(body).to.have.property('msg')
      expect(body).to.have.property('data')
    })
    it('should return a JSON object with payment_no', () => {
      const { data } = resp.body
      expect(data).to.have.property('payment_no')
      order.payment_no = data.payment_no
    })
  })

  describe('POST /api/rest/ticket/cancel', async () => {
    let resp
    it('should return http status code 200', async () => {
      resp = await api.post('/rest/ticket/cancel').set('Authorization', auth).query({
        payment_no: order.payment_no,
        ticket_no: order.ticket_no,
        flight_id: order.flight_id,
        traveler_id: order.traveler_id,
      })
      expect(resp.statusCode).to.eql(StatusCodes.OK)
    })
    it('should return a valid RestResponse JSON object', () => {
      const { body } = resp
      expect(body).to.not.eql({})
      expect(body).to.have.property('status')
      expect(body).to.have.property('code')
      expect(body).to.have.property('msg')
      expect(body).to.have.property('data')
    })
    it('should return a JSON object with payment_no, refund_no', () => {
      const { data } = resp.body
      expect(data).to.have.property('payment_no')
      expect(data).to.have.property('refund_no')
      order.payment_no = data.payment_no
      order.refund_no = data.refund_no
    })
  })
})

describe('Core Flow #2 book->cancel', () => {
  let auth
  let order
  before(() => {
    auth = fixtures[0].header.authorization
    order = fixtures[0].input
  })

  describe('POST /api/rest/ticket/book', () => {
    let resp
    it('should return http status code 200', async () => {
      resp = await api
        .post('/rest/ticket/book')
        .set('Authorization', auth)
        .query({ flight_id: order.flight_id, traveler_id: order.traveler_id })
      expect(resp.statusCode).to.eql(StatusCodes.OK)
    })
    it('should return a valid IRestResponse JSON obejct', () => {
      const { body } = resp
      expect(body).to.not.eql({})
      expect(body).to.have.property('status')
      expect(body).to.have.property('code')
      expect(body).to.have.property('msg')
      expect(body).to.have.property('data')
    })
    it('should return a JSON object with ticket_no and ticket_price', () => {
      const { data } = resp.body
      expect(data).to.have.property('ticket_no')
      expect(data).to.have.property('ticket_price')
      order.ticket_no = data.ticket_no
      order.ticket_price = data.ticket_price
    })
  })

  describe('POST /api/rest/ticket/cancel', async () => {
    let resp
    it('should return http status code 200', async () => {
      resp = await api.post('/rest/ticket/cancel').set('Authorization', auth).query({
        payment_no: order.payment_no,
        ticket_no: order.ticket_no,
        flight_id: order.flight_id,
        traveler_id: order.traveler_id,
      })
      expect(resp.statusCode).to.eql(StatusCodes.OK)
    })
    it('should return a valid IRestResponse JSON object', () => {
      const { body } = resp
      expect(body).to.not.eql({})
      expect(body).to.have.property('status')
      expect(body).to.have.property('code')
      expect(body).to.have.property('msg')
      expect(body).to.have.property('data')
    })
    it('should return a JSON object with payment_no', () => {
      const { data } = resp.body
      expect(data).to.have.property('payment_no')
      order.payment_no = data.payment_no
    })
  })
})

describe('Core Flows #3 get one flight thumb', () => {
  let order = fixtures[0].input
  let queryName = 'getFlightThumb'
  let queryParams = [`flightId:${order.flight_id}`]
  let fields = ['id', 'capacity', 'remainSeats', 'currentPrice']

  describe(`POST /api/graphql#${queryName}`, () => {
    let resp
    it('should return http status code 200', async () => {
      resp = await api
        .post('/graphql')
        .send({ query: `{ ${queryName}(${queryParams.join(',')}) { ${fields.join(',')} } }` })
      expect(resp.statusCode).to.be.eql(StatusCodes.OK)
    })
    it('should return a flight thumb', () => {
      expect(resp).to.have.property('body')
      expect(resp.body).to.have.property('data')

      const { data } = resp.body

      expect(data).to.have.property(queryName)
      expect(data[queryName]).to.not.be.empty
      fields.forEach((val) => {
        expect(data[queryName]).to.have.property(val)
      })
    })
  })
})

describe('Core Flows #4 list flight thumbs', () => {
  let queryName = 'listFlightThumbs'
  let fields = ['id', 'capacity', 'remainSeats', 'currentPrice']

  describe(`POST /api/graphql#${queryName}`, () => {
    let resp
    it('should return http status code 200', async () => {
      resp = await api.post('/graphql').send({ query: `{ ${queryName} { ${fields.join(',')} } }` })
      expect(resp.statusCode).to.be.eql(StatusCodes.OK)
    })
    it('should return a list of flight thumbs', () => {
      expect(resp).to.have.property('body')
      expect(resp.body).to.have.property('data')

      const { data } = resp.body

      expect(data).to.have.property(queryName)
      expect(data[queryName]).to.be.an('array').that.is.not.empty
      fields.forEach((val) => {
        expect(data[queryName][0]).to.have.property(val)
      })
    })
  })
})

describe('Core Flows #5 get->book->pay->get', () => {
  let auth
  let order
  let queryParams
  let remainSeats
  let remainSeatsNext

  before(() => {
    auth = fixtures[0].header.authorization
    order = fixtures[0].input
    queryParams = [`flightId:${order.flight_id}`]
  })

  let queryName = 'getFlightThumb'
  let fields = ['id', 'capacity', 'remainSeats', 'currentPrice']

  describe(`POST /api/graphql#${queryName}`, () => {
    let resp
    it('should return http status code 200', async () => {
      resp = await api
        .post('/graphql')
        .send({ query: `{ ${queryName}(${queryParams.join(',')}) { ${fields.join(',')} } }` })
      expect(resp.statusCode).to.be.eql(StatusCodes.OK)
    })
    it('should return a list of flight thumbs', () => {
      expect(resp).to.have.property('body')
      expect(resp.body).to.have.property('data')

      const { data } = resp.body

      expect(data).to.have.property(queryName)
      expect(data[queryName]).to.not.be.empty
      fields.forEach((val) => {
        expect(data[queryName]).to.have.property(val)
      })
      remainSeats = data[queryName]['remainSeats']
    })
  })

  describe('POST /api/rest/ticket/book', () => {
    let resp
    it('should return http status code 200', async () => {
      resp = await api
        .post('/rest/ticket/book')
        .set('Authorization', auth)
        .query({ flight_id: order.flight_id, traveler_id: order.traveler_id })
      expect(resp.statusCode).to.eql(StatusCodes.OK)
    })
    it('should return a valid IRestResponse JSON obejct', () => {
      const { body } = resp
      expect(body).to.not.eql({})
      expect(body).to.have.property('status')
      expect(body).to.have.property('code')
      expect(body).to.have.property('msg')
      expect(body).to.have.property('data')
    })
    it('should return a JSON object with ticket_no and ticket_price', () => {
      const { data } = resp.body
      expect(data).to.have.property('ticket_no')
      expect(data).to.have.property('ticket_price')
      order.ticket_no = data.ticket_no
      order.ticket_price = data.ticket_price
    })
  })

  describe('POST /api/rest/ticket/pay', async () => {
    let resp
    it('should return http status code 200', async () => {
      resp = await api
        .post('/rest/ticket/pay')
        .set('Authorization', auth)
        .query({ ticket_no: order.ticket_no, flight_id: order.flight_id, traveler_id: order.traveler_id })
      expect(resp.statusCode).to.eql(StatusCodes.OK)
    })
    it('should return a valid IRestResponse JSON object', () => {
      const { body } = resp
      expect(body).to.not.eql({})
      expect(body).to.have.property('status')
      expect(body).to.have.property('code')
      expect(body).to.have.property('msg')
      expect(body).to.have.property('data')
    })
    it('should return a JSON object with payment_no', () => {
      const { data } = resp.body
      expect(data).to.have.property('payment_no')
      order.payment_no = data.payment_no
    })
  })

  describe(`POST /api/graphql#${queryName}`, () => {
    let resp
    it('should return http status code 200', async () => {
      resp = await api
        .post('/graphql')
        .send({ query: `{ ${queryName}(${queryParams.join(',')}) { ${fields.join(',')} } }` })
      expect(resp.statusCode).to.be.eql(StatusCodes.OK)
    })
    it('should return a list of flight thumbs', () => {
      expect(resp).to.have.property('body')
      expect(resp.body).to.have.property('data')

      const { data } = resp.body

      expect(data).to.have.property(queryName)
      expect(data[queryName]).to.not.be.empty
      fields.forEach((val) => {
        expect(data[queryName]).to.have.property(val)
      })
      remainSeatsNext = data[queryName]['remainSeats']
    })
    it('should have remainSeats reduced by 1', () => {
      expect(remainSeats - remainSeatsNext).to.be.eql(1)
    })
  })
})
