import React, { useEffect } from "react";
import { RFQWizard } from "@/components/rfqs/RFQWizard";

const NewRFQ: React.FC = () => {
  useEffect(() => {
    document.title = "New RFQ | CarRental Pro";
  }, []);

  return <RFQWizard />;
};

export default NewRFQ;