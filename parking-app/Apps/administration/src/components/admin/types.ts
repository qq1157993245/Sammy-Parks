export interface Enforcer {
  id: string;
  name: string;
  email: string;
  suspended: boolean;
  status: 'active' | 'suspended';
}


export interface NewEnforcer {
  email: string;
  name: string;
  password: string;
  status: "active" | "suspended";
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  suspended: boolean;
  status: 'active' | 'suspended';
}


export interface Ticket {
  id: string;
  data: {
    driverId: string;
    driverName: string;
    violation: string;
    overridden: boolean;
    paid: boolean;
    amount: number;
    issuedBy: string;
    createdAt: string;
    challenged: boolean;
    challengeMessage: string;
    challengeDenied: boolean;
  };
}

export interface TicketType {
  id: string,
  price: number,
  violation: string,
}

export interface Vehicle {
  plate: string,
  id: string,
  state: string
}
