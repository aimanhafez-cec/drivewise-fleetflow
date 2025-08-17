import React, { useEffect } from "react";
import { RFQWizard } from "@/components/rfqs/RFQWizard";

const NewRFQ: React.FC = () => {
  useEffect(() => {
    document.title = "New RFQ | CEC Car Rental";
  }, []);

  return <RFQWizard />;
};

export default NewRFQ;