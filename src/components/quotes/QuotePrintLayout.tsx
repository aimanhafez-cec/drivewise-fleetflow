import React from 'react';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateForDisplay } from '@/lib/utils/dateUtils';
import autostradLogo from '@/assets/autostrad-logo.png';

interface QuotePrintLayoutProps {
  data: any;
  totals: any;
  costSheet?: any;
}

export const QuotePrintLayout: React.FC<QuotePrintLayoutProps> = ({ data, totals, costSheet }) => {
  const quoteDate = data.created_at ? new Date(data.created_at) : new Date();
  const validUntil = new Date(quoteDate);
  validUntil.setDate(validUntil.getDate() + 30);

  // Extract representative values from first line
  const firstLine = data.quote_items?.[0];
  const durationMonths = firstLine?.duration_months || Math.floor((data.duration_days || 0) / 30);
  const mileagePerMonth = firstLine?.mileage_package_km || null;
  const excessKmRate = firstLine?.excess_km_rate || null;
  const totalVehicles = data.quote_items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0;
  const depositPerVehicle = firstLine?.deposit_amount || 0;
  const totalDeposit = data.quote_items?.reduce((sum: number, item: any) => sum + ((item.deposit_amount || 0) * (item.quantity || 1)), 0) || 0;

  return (
    <div className="print-layout bg-white text-black p-8 max-w-[210mm] mx-auto">
      {/* Header Section */}
      <div className="print-section print-no-break mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <img src={autostradLogo} alt="Autostrad" className="print-logo w-48 mb-2" />
            <div className="text-sm">
              <p className="font-semibold">Autostrad Rent a Car</p>
              <p className="text-xs text-gray-600">أوتوستراد لتأجير السيارات</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <h1 className="text-2xl font-bold mb-2">QUOTATION</h1>
            <p><strong>Quote #:</strong> {data.quote_number || 'Q-DRAFT'}</p>
            <p><strong>Date:</strong> {formatDateForDisplay(quoteDate)}</p>
            <p><strong>Valid Until:</strong> {formatDateForDisplay(validUntil)}</p>
          </div>
        </div>

        <div className="border-t-2 border-gray-800 my-4"></div>

        {/* Company & Customer Info */}
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div>
            <h3 className="font-bold mb-2 text-gray-700">FROM:</h3>
            <p className="font-semibold">Autostrad Rent a Car LLC</p>
            <p>Dubai, United Arab Emirates</p>
            <p>Phone: +971 4 123 4567</p>
            <p>Email: info@autostrad.ae</p>
            <p>Website: www.autostrad.ae</p>
            <p className="mt-1"><strong>TRN:</strong> 100123456789012</p>
          </div>
          <div>
            <h3 className="font-bold mb-2 text-gray-700">BILL TO:</h3>
            <p className="font-semibold">{data.customer_name || 'Customer Name'}</p>
            {data.customer_contact && <p>{data.customer_contact}</p>}
            {data.customer_email && <p>{data.customer_email}</p>}
            {data.billing_address && <p className="mt-1">{data.billing_address}</p>}
          </div>
        </div>
      </div>

      {/* Contract Summary Box */}
      <div className="print-section print-no-break mb-6 bg-gray-50 border-2 border-gray-800 p-4 rounded">
        <h2 className="text-lg font-bold mb-3 text-center">CONTRACT SUMMARY</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-semibold">Total Vehicles:</span>
            <span>{totalVehicles}</span>
          </div>
          {durationMonths > 0 && (
            <div className="flex justify-between">
              <span className="font-semibold">Contract Term:</span>
              <span>{durationMonths} months</span>
            </div>
          )}
          {mileagePerMonth && (
            <div className="flex justify-between">
              <span className="font-semibold">Mileage Package:</span>
              <span>{mileagePerMonth.toLocaleString()} km/month per vehicle</span>
            </div>
          )}
          {data.billing_plan && (
            <div className="flex justify-between">
              <span className="font-semibold">Billing Cycle:</span>
              <span className="capitalize">{data.billing_plan}</span>
            </div>
          )}
          {totalDeposit > 0 && (
            <div className="flex justify-between">
              <span className="font-semibold">Total Deposit:</span>
              <span>{formatCurrency(totalDeposit, 'AED')}</span>
            </div>
          )}
          {data.advance_rent_months && (
            <div className="flex justify-between">
              <span className="font-semibold">Advance Payment:</span>
              <span>{data.advance_rent_months} month(s)</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="font-semibold">Quote Type:</span>
            <span>{data.quote_type === 'corporate_leasing' ? 'Corporate Leasing' : 'Legacy Quote'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Currency:</span>
            <span>AED</span>
          </div>
        </div>
      </div>

      {/* Vehicle Lines Table */}
      <div className="print-section mb-6">
        <h3 className="font-bold text-lg mb-3">VEHICLE DETAILS</h3>
        <table className="print-table w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 p-2 text-left">#</th>
              <th className="border border-gray-400 p-2 text-left">Vehicle</th>
              <th className="border border-gray-400 p-2 text-center">Qty</th>
              <th className="border border-gray-400 p-2 text-right">Mileage/Month</th>
              <th className="border border-gray-400 p-2 text-right">Deposit</th>
              <th className="border border-gray-400 p-2 text-right">Rate/Month</th>
              <th className="border border-gray-400 p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.quote_items?.map((item: any, index: number) => {
              const vehicleName = item._vehicleMeta?.make && item._vehicleMeta?.model 
                ? `${item._vehicleMeta.make} ${item._vehicleMeta.model}${item._vehicleMeta.year ? ` (${item._vehicleMeta.year})` : ''}`
                : item.vehicle_name || item.vehicle_class_name || 'Vehicle';
              
              const vehicleDetails = item._vehicleMeta?.color ? ` - ${item._vehicleMeta.color}` : '';
              const quantity = item.quantity || 1;
              const monthlyRate = item.monthly_rate || 0;
              const lineTotal = monthlyRate * quantity * (durationMonths || 1);
              const mileage = item.mileage_package_km || 0;
              const deposit = item.deposit_amount || 0;

              return (
                <tr key={item.id || index}>
                  <td className="border border-gray-400 p-2">{item.line_no || index + 1}</td>
                  <td className="border border-gray-400 p-2">
                    <div className="font-semibold">{vehicleName}</div>
                    {vehicleDetails && <div className="text-xs text-gray-600">{vehicleDetails}</div>}
                    {item.vehicle_class && (
                      <div className="text-xs text-gray-500">{item.vehicle_class}</div>
                    )}
                  </td>
                  <td className="border border-gray-400 p-2 text-center">{quantity}</td>
                  <td className="border border-gray-400 p-2 text-right">
                    {mileage > 0 ? `${mileage.toLocaleString()} km` : '-'}
                  </td>
                  <td className="border border-gray-400 p-2 text-right font-mono">
                    {deposit > 0 ? formatCurrency(deposit, 'AED') : '-'}
                  </td>
                  <td className="border border-gray-400 p-2 text-right font-mono">
                    {formatCurrency(monthlyRate, 'AED')}
                  </td>
                  <td className="border border-gray-400 p-2 text-right font-mono font-semibold">
                    {formatCurrency(lineTotal, 'AED')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add-Ons & Extras */}
      {data.add_ons && data.add_ons.length > 0 && (
        <div className="print-section print-no-break mb-6">
          <h3 className="font-bold text-lg mb-3">ADD-ONS & EXTRAS</h3>
          <table className="print-table w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-2 text-left">Description</th>
                <th className="border border-gray-400 p-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.add_ons.map((addon: any, index: number) => (
                <tr key={index}>
                  <td className="border border-gray-400 p-2">{addon.name}</td>
                  <td className="border border-gray-400 p-2 text-right font-mono">
                    {formatCurrency(addon.price || 0, 'AED')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Financial Summary */}
      <div className="print-section print-no-break mb-6">
        <div className="ml-auto max-w-md">
          <table className="w-full text-sm">
            <tbody>
              {totals.deposit > 0 && (
                <tr>
                  <td className="py-2 text-right pr-4">Security Deposit:</td>
                  <td className="py-2 text-right font-mono font-semibold">
                    {formatCurrency(totals.deposit, 'AED')}
                  </td>
                </tr>
              )}
              {totals.advance > 0 && (
                <tr>
                  <td className="py-2 text-right pr-4">Advance Payment:</td>
                  <td className="py-2 text-right font-mono font-semibold">
                    {formatCurrency(totals.advance, 'AED')}
                  </td>
                </tr>
              )}
              <tr>
                <td className="py-2 text-right pr-4">Subtotal (Rental):</td>
                <td className="py-2 text-right font-mono">
                  {formatCurrency(totals.rental, 'AED')}
                </td>
              </tr>
              {totals.vat > 0 && (
                <tr>
                  <td className="py-2 text-right pr-4">VAT (5%):</td>
                  <td className="py-2 text-right font-mono">
                    {formatCurrency(totals.vat, 'AED')}
                  </td>
                </tr>
              )}
              <tr className="border-t-2 border-gray-800">
                <td className="py-3 text-right pr-4 font-bold text-lg">GRAND TOTAL:</td>
                <td className="py-3 text-right font-mono font-bold text-lg">
                  {formatCurrency(totals.grandTotal, 'AED')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="print-section mb-6">
        <h3 className="font-bold text-lg mb-3">TERMS & CONDITIONS</h3>
        <div className="text-sm space-y-2 border border-gray-300 p-4 rounded">
          {durationMonths > 0 && (
            <p><strong>•</strong> Contract Duration: {durationMonths} months from the start date.</p>
          )}
          {mileagePerMonth && (
            <p><strong>•</strong> Mileage Allowance: {mileagePerMonth.toLocaleString()} km per month per vehicle. Total allowance: {(mileagePerMonth * (durationMonths || 1) * totalVehicles).toLocaleString()} km over the contract term.</p>
          )}
          {excessKmRate && (
            <p><strong>•</strong> Excess Kilometer Charges: {formatCurrency(excessKmRate, 'AED')} per km for any mileage exceeding the monthly allowance.</p>
          )}
          {data.billing_plan && (
            <p><strong>•</strong> Billing Schedule: {data.billing_plan.charAt(0).toUpperCase() + data.billing_plan.slice(1)} billing. Invoices will be generated at the start of each billing period.</p>
          )}
          {data.advance_rent_months && data.advance_rent_months > 0 && (
            <p><strong>•</strong> Advance Payment: {data.advance_rent_months} month(s) rent to be paid in advance at contract signing.</p>
          )}
          {totalDeposit > 0 && (
            <p><strong>•</strong> Security Deposit: {formatCurrency(totalDeposit, 'AED')} refundable security deposit required ({formatCurrency(depositPerVehicle, 'AED')} per vehicle). Deposit will be refunded upon satisfactory return of vehicle(s).</p>
          )}
          {data.grace_period_days && (
            <p><strong>•</strong> Grace Period: {data.grace_period_days} days grace period for payments. Late payment fee of {data.late_fee_percentage || 5}% applies thereafter.</p>
          )}
          <p><strong>•</strong> Toll & Fines Policy: {data.toll_fines_policy || 'Customer is responsible for all toll charges (Salik) and traffic fines incurred during the rental period. Admin fee applies for processing.'}</p>
          <p><strong>•</strong> Payment Terms: {data.payment_terms || 'Payment is due as per the agreed billing schedule. Late payments may incur additional charges.'}</p>
          <p><strong>•</strong> Insurance: Comprehensive insurance is included. Excess/deductible applies as per policy terms. Customer is responsible for any damages not covered by insurance.</p>
          <p><strong>•</strong> Maintenance: Regular maintenance and servicing are included as per manufacturer guidelines. Customer must report any mechanical issues immediately.</p>
          <p><strong>•</strong> Replacement Vehicle: Provided during scheduled maintenance</p>
          <p><strong>•</strong> Early Termination: Early termination may be subject to penalties equivalent to remaining contract value or as outlined in the lease agreement.</p>
          <p><strong>•</strong> VAT: All prices are subject to 5% VAT as per UAE regulations. VAT registration number will be provided on the final invoice.</p>
          <p className="mt-3 text-xs text-gray-600"><strong>Note:</strong> This quotation is valid for 30 days from the issue date. Terms and conditions are subject to final contract agreement. Vehicle availability is subject to confirmation at the time of booking.</p>
        </div>
      </div>

      {/* Additional Notes */}
      {data.notes && (
        <div className="print-section print-no-break mb-6">
          <h3 className="font-bold text-lg mb-3">ADDITIONAL NOTES</h3>
          <div className="text-sm border border-gray-300 p-4 rounded whitespace-pre-wrap">
            {data.notes}
          </div>
        </div>
      )}

      {/* Signature Section */}
      <div className="print-section print-no-break mt-12">
        <div className="border-t-2 border-gray-800 pt-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="mb-8">Prepared by:</p>
              <div className="border-b border-gray-400 mb-2"></div>
              <p className="text-sm text-gray-600">Autostrad Representative</p>
            </div>
            <div>
              <p className="mb-8">Customer Acceptance:</p>
              <div className="border-b border-gray-400 mb-2"></div>
              <p className="text-sm text-gray-600">Signature & Date</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="print-section mt-8 text-center text-xs text-gray-600 border-t border-gray-300 pt-4">
        <p>Autostrad Rent a Car LLC | Dubai, UAE | TRN: 100123456789012</p>
        <p>This is a computer-generated quotation and is valid without signature.</p>
      </div>
    </div>
  );
};
