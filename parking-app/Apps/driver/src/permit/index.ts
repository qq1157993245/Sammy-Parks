export interface NewPermit {
    typeId: string,
    vehicleId: string,
    zoneTypeId: string
}

export interface Permit {
    id: string,
    vehicleId: string,
    startTime: string,
    endTime: string,
    plate: string,
    zone: string
}

export interface PermitType {
    id: string,
    type: string,
    duration: number,
    price: number,
}

export interface PermitZone {
    id: string,
    zone: string,
    maxPermits: number
}