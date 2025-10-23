import { InspectionMaster } from '@/types/inspection';
import './print-blank-card.css';

interface PrintBlankCardProps {
  mode: 'blank' | 'prefilled';
  inspectionData?: InspectionMaster;
}

const CHECKLIST_ITEMS = [
  'Exterior Body',
  'Glass & Windows',
  'Tires & Rims',
  'Interior Condition',
  'Accessories & Equipment',
  'Engine Condition',
  'Fluids (Oil, Coolant, Brake)',
  'Battery',
  'Lights & Signals',
  'Wipers & Washers'
];

export function PrintBlankCard({ mode, inspectionData }: PrintBlankCardProps) {
  const currentDate = new Date().toLocaleDateString();
  
  return (
    <div className="print-card" id="print-blank-card">
      {/* Header */}
      <div className="print-header">
        <div className="print-logo-area">
          <div className="print-logo-placeholder">COMPANY LOGO</div>
        </div>
        <div className="print-title-area">
          <h1>VEHICLE INSPECTION CARD</h1>
          <p>Corporate Leasing Operations</p>
        </div>
      </div>

      {/* Inspection Details */}
      <div className="print-section">
        <h2>Inspection Details</h2>
        <div className="print-grid">
          <div className="print-field">
            <label>Inspection No:</label>
            <div className="print-value">{mode === 'prefilled' ? inspectionData?.inspection_no : '_______________'}</div>
          </div>
          <div className="print-field">
            <label>Date:</label>
            <div className="print-value">{mode === 'prefilled' ? new Date(inspectionData?.entry_date || '').toLocaleDateString() : currentDate}</div>
          </div>
          <div className="print-field">
            <label>Time:</label>
            <div className="print-value">____:____</div>
          </div>
          <div className="print-field">
            <label>Type:</label>
            <div className="print-value">{mode === 'prefilled' ? inspectionData?.inspection_type : '_______________'}</div>
          </div>
        </div>
      </div>

      {/* Vehicle Information */}
      <div className="print-section">
        <h2>Vehicle Information</h2>
        <div className="print-grid">
          <div className="print-field full-width">
            <label>VIN:</label>
            <div className="print-value">{mode === 'prefilled' ? inspectionData?.vin : '___________________________________'}</div>
          </div>
          <div className="print-field">
            <label>Item Code:</label>
            <div className="print-value">{mode === 'prefilled' ? inspectionData?.item_code : '_______________'}</div>
          </div>
          <div className="print-field">
            <label>Odometer (km):</label>
            <div className="print-value">{mode === 'prefilled' ? inspectionData?.metrics?.odometer : '_______________'}</div>
          </div>
        </div>
      </div>

      {/* Vehicle Damage Diagrams */}
      <div className="print-section">
        <h2>Vehicle Damage Assessment</h2>
        <p className="print-instructions">Mark any visible damage on the diagrams below:</p>
        <div className="print-diagrams">
          <div className="print-diagram">
            <div className="print-diagram-box">FRONT VIEW</div>
            <p>Front</p>
          </div>
          <div className="print-diagram">
            <div className="print-diagram-box">LEFT VIEW</div>
            <p>Left Side</p>
          </div>
          <div className="print-diagram">
            <div className="print-diagram-box">RIGHT VIEW</div>
            <p>Right Side</p>
          </div>
          <div className="print-diagram">
            <div className="print-diagram-box">REAR VIEW</div>
            <p>Rear</p>
          </div>
          <div className="print-diagram">
            <div className="print-diagram-box">TOP VIEW</div>
            <p>Top</p>
          </div>
        </div>
      </div>

      {/* Page Break */}
      <div className="print-page-break"></div>

      {/* Inspection Checklist */}
      <div className="print-section">
        <h2>Inspection Checklist</h2>
        <table className="print-checklist-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>OK</th>
              <th>DAMAGE</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {CHECKLIST_ITEMS.map((item, index) => (
              <tr key={index}>
                <td>{item}</td>
                <td className="print-checkbox">☐</td>
                <td className="print-checkbox">☐</td>
                <td className="print-notes-cell"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fuel Level */}
      <div className="print-section">
        <h2>Fuel Level</h2>
        <div className="print-fuel-gauge">
          <div className="print-fuel-marker">E</div>
          <div className="print-fuel-marker">¼</div>
          <div className="print-fuel-marker">½</div>
          <div className="print-fuel-marker">¾</div>
          <div className="print-fuel-marker">F</div>
        </div>
        <p className="print-instructions">Circle the current fuel level</p>
      </div>

      {/* Additional Notes */}
      <div className="print-section">
        <h2>Additional Notes</h2>
        <div className="print-notes-area">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="print-notes-line"></div>
          ))}
        </div>
      </div>

      {/* Signature Section */}
      <div className="print-section print-signature-section">
        <h2>Inspector Signature</h2>
        <div className="print-grid">
          <div className="print-field full-width">
            <label>Inspector Name:</label>
            <div className="print-value print-signature-line">
              {mode === 'prefilled' ? inspectionData?.signature?.name : ''}
            </div>
          </div>
          <div className="print-field full-width">
            <label>Signature:</label>
            <div className="print-signature-box">
              {mode === 'prefilled' && inspectionData?.signature?.imageUrl && (
                <img src={inspectionData.signature.imageUrl} alt="Signature" />
              )}
            </div>
          </div>
          <div className="print-field">
            <label>Date:</label>
            <div className="print-value">____/____/________</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="print-footer">
        <p>This inspection card is property of the company. Keep with vehicle documents.</p>
      </div>
    </div>
  );
}
