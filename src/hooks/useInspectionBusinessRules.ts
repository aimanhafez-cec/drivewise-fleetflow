import { useMemo } from 'react';
import type { InspectionData, DamageMarker } from '@/types/agreement-wizard';
import {
  calculateFuelCharge,
  calculateExcessKmCharge,
  calculateCleaningFee,
  calculateLateReturnCharge,
  calculateAllDamages,
  calculateTotalCharges,
  calculateDepositRefund,
  type FuelPolicy,
  type CleaningType,
  type DamageCharge,
  type TotalCharges,
} from '@/lib/utils/uaeBusinessRules';

interface UseInspectionBusinessRulesProps {
  checkoutData: InspectionData | null;
  checkinData: InspectionData | null;
  agreementDetails?: {
    includedKm: number;
    dailyRate: number;
    vehicleClass: 'economy' | 'standard' | 'luxury' | 'premium';
    fuelPolicy: FuelPolicy;
    tankCapacity: number;
    securityDeposit: number;
    insuranceExcess: number;
    scheduledReturnDate: Date;
    actualReturnDate: Date;
    cleaningType: CleaningType;
    salikTrips: number;
  };
}

export function useInspectionBusinessRules({
  checkoutData,
  checkinData,
  agreementDetails = {
    includedKm: 500,
    dailyRate: 200,
    vehicleClass: 'standard',
    fuelPolicy: 'FULL_TO_FULL',
    tankCapacity: 60,
    securityDeposit: 1500,
    insuranceExcess: 1500,
    scheduledReturnDate: new Date(),
    actualReturnDate: new Date(),
    cleaningType: 'none',
    salikTrips: 0,
  },
}: UseInspectionBusinessRulesProps) {
  // Calculate fuel charge
  const fuelCharge = useMemo(() => {
    if (!checkoutData || !checkinData) return 0;

    return calculateFuelCharge(
      checkoutData.fuelLevel,
      checkinData.fuelLevel,
      agreementDetails.fuelPolicy,
      agreementDetails.tankCapacity
    );
  }, [checkoutData, checkinData, agreementDetails.fuelPolicy, agreementDetails.tankCapacity]);

  // Calculate excess km charge
  const excessKmResult = useMemo(() => {
    if (!checkoutData || !checkinData) {
      return { excessKm: 0, charge: 0, roundedKm: 0 };
    }

    return calculateExcessKmCharge(
      checkoutData.odometerReading,
      checkinData.odometerReading,
      agreementDetails.includedKm,
      agreementDetails.vehicleClass
    );
  }, [checkoutData, checkinData, agreementDetails.includedKm, agreementDetails.vehicleClass]);

  // Calculate cleaning fee
  const cleaningFee = useMemo(() => {
    return calculateCleaningFee(agreementDetails.cleaningType);
  }, [agreementDetails.cleaningType]);

  // Calculate late return charge
  const lateReturnResult = useMemo(() => {
    return calculateLateReturnCharge(
      agreementDetails.scheduledReturnDate,
      agreementDetails.actualReturnDate,
      agreementDetails.vehicleClass,
      agreementDetails.dailyRate
    );
  }, [
    agreementDetails.scheduledReturnDate,
    agreementDetails.actualReturnDate,
    agreementDetails.vehicleClass,
    agreementDetails.dailyRate,
  ]);

  // Calculate Salik charge (AED 8 per trip in UAE)
  const salikCharge = useMemo(() => {
    return agreementDetails.salikTrips * 8;
  }, [agreementDetails.salikTrips]);

  // Calculate all damage charges
  const damageCharges = useMemo<DamageCharge[]>(() => {
    if (!checkoutData || !checkinData) return [];

    return calculateAllDamages(
      checkoutData.damageMarkers,
      checkinData.damageMarkers,
      agreementDetails.insuranceExcess
    );
  }, [checkoutData, checkinData, agreementDetails.insuranceExcess]);

  // Calculate total damage charge amount
  const totalDamageCharge = useMemo(() => {
    return damageCharges.reduce((sum, d) => sum + d.customerLiability, 0);
  }, [damageCharges]);

  // Calculate total charges with VAT
  const totalCharges = useMemo<TotalCharges>(() => {
    return calculateTotalCharges({
      damageCharges: totalDamageCharge,
      fuelCharge,
      excessKmCharge: excessKmResult.charge,
      cleaningFee,
      lateReturnCharge: lateReturnResult.charge,
      salikCharge,
    });
  }, [
    totalDamageCharge,
    fuelCharge,
    excessKmResult.charge,
    cleaningFee,
    lateReturnResult.charge,
    salikCharge,
  ]);

  // Calculate security deposit refund or additional payment
  const depositResult = useMemo(() => {
    return calculateDepositRefund(agreementDetails.securityDeposit, totalCharges.total);
  }, [agreementDetails.securityDeposit, totalCharges.total]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!checkoutData || !checkinData) {
      return {
        fuelDifference: 0,
        kmDriven: 0,
        newDamagesCount: 0,
        preExistingDamagesCount: 0,
      };
    }

    return {
      fuelDifference: checkoutData.fuelLevel - checkinData.fuelLevel,
      kmDriven: checkinData.odometerReading - checkoutData.odometerReading,
      newDamagesCount: damageCharges.filter(d => !d.isPreExisting).length,
      preExistingDamagesCount: damageCharges.filter(d => d.isPreExisting).length,
    };
  }, [checkoutData, checkinData, damageCharges]);

  return {
    fuelCharge,
    excessKm: excessKmResult,
    cleaningFee,
    lateReturn: lateReturnResult,
    salikCharge,
    damageCharges,
    totalDamageCharge,
    totalCharges,
    depositResult,
    metrics,
  };
}
