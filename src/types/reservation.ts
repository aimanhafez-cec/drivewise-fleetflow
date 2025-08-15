
export interface ReservationDriver {
  id: string;
  driverId: string;
  role: 'PRIMARY' | 'ADDITIONAL';
}

export interface ReservationLine {
  id: string;
  lineNo: number;
  reservationTypeId: string;
  vehicleClassId: string;
  vehicleId: string;
  checkOutDate: Date | null;
  checkInDate: Date | null;
  lineNetPrice: number;
  taxValue: number;
  lineTotal: number;
  drivers?: ReservationDriver[];
}
