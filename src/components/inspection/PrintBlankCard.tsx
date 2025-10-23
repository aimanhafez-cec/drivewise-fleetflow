import './print-blank-card.css';
import { InspectionMaster } from '@/types/inspection';
import templateImage from '@/assets/vehicle-damage-report-template.jpeg';

interface PrintBlankCardProps {
  mode: 'blank' | 'prefilled';
  inspectionData?: InspectionMaster;
}

export function PrintBlankCard({ mode, inspectionData }: PrintBlankCardProps) {
  if (mode === 'blank') {
    // Render the template image as a full-page background for blank cards
    return (
      <div className="print-damage-report blank-template">
        <img 
          src={templateImage} 
          alt="Vehicle Damage Report Template" 
          className="template-image"
        />
      </div>
    );
  }

  // Prefilled mode - show the template with data overlays
  return (
    <div className="print-damage-report prefilled-template">
      <img 
        src={templateImage} 
        alt="Vehicle Damage Report" 
        className="template-image"
      />
      
      {/* Overlay key fields on top of the template */}
      <div className="template-overlays">
        {/* KM OUT */}
        {inspectionData?.metrics?.odometer && (
          <div className="overlay-field" style={{ top: '142px', left: '520px' }}>
            {inspectionData.metrics.odometer}
          </div>
        )}
        
        {/* VIN */}
        {inspectionData?.vin && (
          <div className="overlay-field" style={{ top: '185px', left: '150px' }}>
            {inspectionData.vin}
          </div>
        )}
        
        {/* Item Code */}
        {inspectionData?.item_code && (
          <div className="overlay-field" style={{ top: '185px', left: '450px' }}>
            {inspectionData.item_code}
          </div>
        )}
        
        {/* Date */}
        {inspectionData?.entry_date && (
          <div className="overlay-field" style={{ top: '920px', left: '100px' }}>
            {new Date(inspectionData.entry_date).toLocaleDateString()}
          </div>
        )}
        
        {/* Signature Image */}
        {inspectionData?.signature?.imageUrl && (
          <div className="overlay-signature" style={{ top: '950px', left: '300px' }}>
            <img 
              src={inspectionData.signature.imageUrl} 
              alt="Signature" 
              style={{ width: '200px', height: 'auto' }}
            />
          </div>
        )}
        
        {/* Customer Name */}
        {inspectionData?.signature?.name && (
          <div className="overlay-field" style={{ top: '920px', left: '300px' }}>
            {inspectionData.signature.name}
          </div>
        )}
      </div>
    </div>
  );
}
