import React from "react";
import { MasterAgreementAttachments } from "../MasterAgreementAttachments";

interface MasterAgreementStep5AttachmentsProps {
  data: { id?: string };
}

export const MasterAgreementStep5Attachments: React.FC<MasterAgreementStep5AttachmentsProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Attachments</h2>
        <p className="text-muted-foreground">
          Upload supporting documents, images, or add links related to this master agreement.
          This step is optional and can be completed later.
        </p>
      </div>

      <MasterAgreementAttachments agreementId={data.id} />

      {!data.id && (
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Note:</strong> Please save your master agreement first before adding attachments.
            You can add attachments after saving as draft.
          </p>
        </div>
      )}
    </div>
  );
};