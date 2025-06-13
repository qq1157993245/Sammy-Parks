export interface Ticket {
  id: string,
  data: {
    driverId: string
    violation: string
    overridden: boolean,
    paid: boolean,
    price: number,
    issuedBy: string,
    createdAt: string,
    challenged: boolean,
    challengeMessage: string,
    challengeDenied: boolean,
    challengeAccepted: boolean
  }
}
