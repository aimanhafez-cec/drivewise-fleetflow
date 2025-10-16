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
            <p>Phone: +971 4 XXX XXXX</p>
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

      {/* Quote Type & Duration */}
      <div className="print-section print-no-break mb-6">
        <div className="bg-gray-100 p-4 rounded text-sm">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="font-semibold">Quote Type:</span>{' '}
              <span className="capitalize">{data.quote_type?.replace('_', ' ') || 'Daily Rental'}</span>
            </div>
            {data.contract_duration_months && (
              <div>
                <span className="font-semibold">Duration:</span>{' '}
                {data.contract_duration_months} months
              </div>
            )}
            {data.mileage_option && (
              <div>
                <span className="font-semibold">Mileage:</span>{' '}
                {data.mileage_included_km_per_month} km/month
              </div>
            )}
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
              <th className="border border-gray-400 p-2 text-right">Rate/Month</th>
              <th className="border border-gray-400 p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.quote_items?.map((item: any, index: number) => {
              const lineTotal = (item.monthly_rate || 0) * (data.contract_duration_months || 1);
              return (
                <tr key={item.id || index}>
                  <td className="border border-gray-400 p-2">{item.line_no || index + 1}</td>
                  <td className="border border-gray-400 p-2">
                    <div className="font-semibold">{item.vehicle_name || 'Vehicle'}</div>
                    {item.vehicle_class && (
                      <div className="text-xs text-gray-600">{item.vehicle_class}</div>
                    )}
                  </td>
                  <td className="border border-gray-400 p-2 text-center">{item.quantity || 1}</td>
                  <td className="border border-gray-400 p-2 text-right font-mono">
                    {formatCurrency(item.monthly_rate || 0, 'AED')}
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
          {data.contract_duration_months && (
            <p><strong>•</strong> Contract Duration: {data.contract_duration_months} months</p>
          )}
          {data.mileage_included_km_per_month && (
            <p><strong>•</strong> Included Mileage: {data.mileage_included_km_per_month} km per month</p>
          )}
          {data.excess_km_rate && (
            <p><strong>•</strong> Excess Mileage Charge: {formatCurrency(data.excess_km_rate, 'AED')} per km</p>
          )}
          {data.toll_fines_policy && (
            <p><strong>•</strong> Toll & Fines: {data.toll_fines_policy}</p>
          )}
          {data.payment_terms && (
            <p><strong>•</strong> Payment Terms: {data.payment_terms}</p>
          )}
          {data.deposit_policy && (
            <p><strong>•</strong> Deposit Policy: {data.deposit_policy}</p>
          )}
          <p><strong>•</strong> Insurance: Comprehensive coverage included</p>
          <p><strong>•</strong> Maintenance: Regular servicing included as per manufacturer schedule</p>
          <p><strong>•</strong> Replacement Vehicle: Provided during scheduled maintenance</p>
          <p><strong>•</strong> This quotation is valid for 30 days from the date of issue</p>
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
