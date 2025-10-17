import React from "react";

interface MasterAgreementStep5Props {
  data: { id?: string };
}

export const MasterAgreementStep5: React.FC<MasterAgreementStep5Props> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Attachments</h2>
        <p className="text-muted-foreground">
          Upload supporting documents for this master agreement. This step is optional.
        </p>
      </div>

      {!data.id && (
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Note:</strong> Save your agreement as draft first before adding attachments.
          </p>
        </div>
      )}
    </div>
  );
};