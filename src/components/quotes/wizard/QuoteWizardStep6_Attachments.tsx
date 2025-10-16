import React from "react";
import { QuoteAttachments } from "../QuoteAttachments";

interface QuoteWizardStep6Props {
  data: {
    id?: string;
  };
}

export const QuoteWizardStep6: React.FC<QuoteWizardStep6Props> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Attachments</h2>
        <p className="text-muted-foreground">
          Upload supporting documents, images, or add links related to this quote.
          This step is optional and can be completed later.
        </p>
      </div>

      <QuoteAttachments quoteId={data.id} />

      {!data.id && (
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Note:</strong> Please save your quote first before adding attachments.
            You can add attachments after finalizing the quote.
          </p>
        </div>
      )}
    </div>
  );
};
