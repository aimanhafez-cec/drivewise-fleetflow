import { InspectionMaster } from '@/types/inspection';
import './print-blank-card.css';

interface PrintBlankCardProps {
  mode: 'blank' | 'prefilled';
  inspectionData?: InspectionMaster;
}

const EQUIPMENT_ITEMS = [
  'Radio/Tape',
  'A/C Controls',
  'Glove Box',
  'No of Floor Mats',
  'Lighter',
  'Wheel Caps/Cover',
  'Tool Kit',
  'Jack',
  'Rod Wheel',
  'Wheel Spanner',
  'Spare Tyre',
  'Door Locks',
  'Wing Mirrors',
  'Tint Glass',
  'TV Screen',
  'Sunvisor',
  'Fuel Lid',
  'Salik Tag'
];

export function PrintBlankCard({ mode, inspectionData }: PrintBlankCardProps) {
  const currentDate = new Date().toLocaleDateString();
  
  return (
    <div className="print-damage-report" id="print-damage-report">
      {/* Header */}
      <div className="report-header">
        <div className="report-logo">
          <div className="logo-box">autostrad</div>
        </div>
        <div className="report-title">
          <h1>VEHICLE DAMAGE REPORT</h1>
        </div>
        <div className="report-copy-type">
          <div className="copy-checkbox">
            <input type="checkbox" /> Station Copy
          </div>
          <div className="copy-checkbox">
            <input type="checkbox" /> Customer Copy
          </div>
        </div>
      </div>

      {/* Service Information */}
      <div className="service-info">
        <div className="service-field">
          <label>SERVICE DUE KM:</label>
          <div className="field-value">_____________</div>
        </div>
        <div className="service-field">
          <label>KM OUT:</label>
          <div className="field-value">{mode === 'prefilled' ? inspectionData?.metrics?.odometer : '_____________'}</div>
        </div>
        <div className="service-field">
          <label>KM IN:</label>
          <div className="field-value">_____________</div>
        </div>
      </div>

      {/* Vehicle Information */}
      <div className="vehicle-info-section">
        <div className="vehicle-field">
          <label>VEHICLE TYPE:</label>
          <div className="field-value">{mode === 'prefilled' ? inspectionData?.vin : '_____________________'}</div>
        </div>
        <div className="plate-fields">
          <div className="plate-field">
            <label>PLATE SOURCE:</label>
            <div className="field-value">______</div>
          </div>
          <div className="plate-field">
            <label>PLATE CODE:</label>
            <div className="field-value">______</div>
          </div>
          <div className="plate-field">
            <label>PLATE NUMBER:</label>
            <div className="field-value">__________</div>
          </div>
        </div>
      </div>

      {/* Registration Number Options */}
      <div className="registration-options">
        <label>REGISTRATION NUMBER:</label>
        <div className="reg-checkboxes">
          <label><input type="checkbox" /> RAC</label>
          <label><input type="checkbox" /> MRA</label>
          <label><input type="checkbox" /> LES</label>
          <label><input type="checkbox" /> NRM</label>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="main-content-grid">
        {/* Left Column - Equipment Checklist */}
        <div className="equipment-section">
          <h3>EQUIPMENT CHECKLIST</h3>
          <table className="equipment-table">
            <thead>
              <tr>
                <th>ITEM</th>
                <th>OUT</th>
                <th>IN</th>
              </tr>
            </thead>
            <tbody>
              {EQUIPMENT_ITEMS.map((item, index) => (
                <tr key={index}>
                  <td>{item}</td>
                  <td className="checkbox-cell">☐</td>
                  <td className="checkbox-cell">☐</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Column - Fuel and Vehicle Diagrams */}
        <div className="diagrams-section">
          {/* Fuel Gauges */}
          <div className="fuel-section">
            <div className="fuel-gauge">
              <h4>FUEL OUT</h4>
              <div className="gauge-circle">
                <div className="gauge-markers">
                  <span>F</span>
                  <span>¾</span>
                  <span>½</span>
                  <span>¼</span>
                  <span>E</span>
                </div>
              </div>
            </div>
            <div className="fuel-gauge">
              <h4>FUEL IN</h4>
              <div className="gauge-circle">
                <div className="gauge-markers">
                  <span>F</span>
                  <span>¾</span>
                  <span>½</span>
                  <span>¼</span>
                  <span>E</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Out Diagram */}
          <div className="vehicle-diagram">
            <h4>VEHICLE OUT</h4>
            <div className="diagram-container">
              {/* Top view of vehicle with labeled parts */}
              <div className="vehicle-outline">
                {/* Front section */}
                <div className="vehicle-front">
                  <div className="part-label small">CAP</div>
                  <div className="part-label">HEADLIGHT L</div>
                  <div className="part-label">BONNET</div>
                  <div className="part-label">HEADLIGHT R</div>
                  <div className="part-label small">CAP</div>
                </div>
                {/* Left side */}
                <div className="vehicle-left">
                  <div className="part-label">WING</div>
                  <div className="part-label">DOOR 1</div>
                  <div className="part-label">DOOR 2</div>
                  <div className="part-label">WING</div>
                </div>
                {/* Center */}
                <div className="vehicle-center">
                  <div className="part-label">WINDSCREEN</div>
                  <div className="part-label large">ROOF</div>
                  <div className="part-label">WINDOW</div>
                </div>
                {/* Right side */}
                <div className="vehicle-right">
                  <div className="part-label">WING</div>
                  <div className="part-label">DOOR 3</div>
                  <div className="part-label">DOOR 4</div>
                  <div className="part-label">WING</div>
                  <div className="part-label small">SPARE<br/>TOOLKIT<br/>JACK</div>
                </div>
                {/* Rear section */}
                <div className="vehicle-rear">
                  <div className="part-label small">CAP</div>
                  <div className="part-label small">CAP</div>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle In Diagram */}
          <div className="vehicle-diagram">
            <h4>VEHICLE IN</h4>
            <div className="diagram-container">
              <div className="vehicle-outline">
                <div className="vehicle-front">
                  <div className="part-label small">CAP</div>
                  <div className="part-label">HEADLIGHT L</div>
                  <div className="part-label">BONNET</div>
                  <div className="part-label">HEADLIGHT R</div>
                  <div className="part-label small">CAP</div>
                </div>
                <div className="vehicle-left">
                  <div className="part-label">WING</div>
                  <div className="part-label">DOOR 1</div>
                  <div className="part-label">DOOR 2</div>
                  <div className="part-label">WING</div>
                </div>
                <div className="vehicle-center">
                  <div className="part-label">WINDSCREEN</div>
                  <div className="part-label large">ROOF</div>
                  <div className="part-label">WINDOW</div>
                </div>
                <div className="vehicle-right">
                  <div className="part-label">WING</div>
                  <div className="part-label">DOOR 3</div>
                  <div className="part-label">DOOR 4</div>
                  <div className="part-label">WING</div>
                  <div className="part-label small">SPARE<br/>TOOLKIT<br/>JACK</div>
                </div>
                <div className="vehicle-rear">
                  <div className="part-label small">CAP</div>
                  <div className="part-label small">CAP</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Document Section */}
      <div className="registration-section">
        <div className="reg-doc">
          <h4>REGISTRATION DOCUMENT - VEHICLE OUT</h4>
          <div className="reg-options">
            <label><input type="checkbox" /> ORIGINAL</label>
            <label><input type="checkbox" /> COPY</label>
          </div>
        </div>
        <div className="reg-doc">
          <h4>REGISTRATION DOCUMENT - VEHICLE IN</h4>
          <div className="reg-options">
            <label><input type="checkbox" /> ORIGINAL</label>
            <label><input type="checkbox" /> COPY</label>
          </div>
        </div>
      </div>

      {/* Interior Defects */}
      <div className="defects-section">
        <div className="defect-box">
          <h4>INTERIOR DEFECTS (OUT)</h4>
          <div className="defect-lines">
            {[1, 2, 3, 4].map(i => <div key={i} className="defect-line"></div>)}
          </div>
        </div>
        <div className="defect-box">
          <h4>INTERIOR DEFECTS (IN)</h4>
          <div className="defect-lines">
            {[1, 2, 3, 4].map(i => <div key={i} className="defect-line"></div>)}
          </div>
        </div>
      </div>

      {/* Customer Signature Section */}
      <div className="signature-section">
        <div className="signature-box">
          <h4>CUSTOMER SIGNATURE (OUT)</h4>
          <div className="signature-fields">
            <div className="sig-field">
              <label>DATE:</label>
              <div className="field-value">_______________</div>
            </div>
            <div className="sig-field">
              <label>TIME:</label>
              <div className="field-value">_______________</div>
            </div>
            <div className="sig-field full">
              <label>CUSTOMER NAME:</label>
              <div className="field-value">_____________________________</div>
            </div>
            <div className="sig-area">
              <label>SIGNATURE:</label>
              <div className="signature-space">
                {mode === 'prefilled' && inspectionData?.signature?.imageUrl && (
                  <img src={inspectionData.signature.imageUrl} alt="Signature" />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="signature-box">
          <h4>CUSTOMER SIGNATURE (IN)</h4>
          <div className="signature-fields">
            <div className="sig-field">
              <label>DATE:</label>
              <div className="field-value">_______________</div>
            </div>
            <div className="sig-field">
              <label>TIME:</label>
              <div className="field-value">_______________</div>
            </div>
            <div className="sig-field full">
              <label>CUSTOMER NAME:</label>
              <div className="field-value">_____________________________</div>
            </div>
            <div className="sig-area">
              <label>SIGNATURE:</label>
              <div className="signature-space"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes and Statement */}
      <div className="notes-section">
        <div className="note-box">
          <p className="note-text">
            <strong>PRE-USE NOTIFICATION:</strong> Please check the vehicle for any visible damage before use. 
            Report any issues immediately.
          </p>
        </div>
        <div className="note-box">
          <p className="note-text">
            I hereby acknowledge that I have inspected the vehicle and confirm the above damage report is accurate.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="report-footer">
        <div className="checked-by">
          <label>CHECKED BY:</label>
          <div className="field-value">_____________________</div>
        </div>
        <div className="footer-logo">autostrad</div>
      </div>
    </div>
  );
}
