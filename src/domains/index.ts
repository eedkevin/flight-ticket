import api from '../external/api'
import { messageBroker, sequelize } from '../facilities'

import { AccountDomain, IAccountDomain, redisAccount } from './account'
import { TicketDomain, ITicketDomain, redisTicket } from './ticket'
import { FlightDomain, IFlightDomain, redisFlight } from './flight'
import { BillRepo } from './ticket/repo'

export interface Domains {
  accountDomain: IAccountDomain
  ticketDomain: ITicketDomain
  flightDomain: IFlightDomain
}

const billRepo = new BillRepo(sequelize)

const domains: Domains = {
  accountDomain: new AccountDomain(redisAccount),
  ticketDomain: new TicketDomain(redisTicket, messageBroker, api.airline, api.payment, billRepo),
  flightDomain: new FlightDomain(redisFlight),
}

export default domains
