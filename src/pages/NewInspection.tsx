import React, { useEffect } from "react";
import { StandaloneInspectionWizard } from "@/components/inspection/StandaloneInspectionWizard";

const NewInspection: React.FC = () => {
  useEffect(() => { 
    document.title = "New Inspection | CEC Car Rental"; 
  }, []);

  return <StandaloneInspectionWizard />;
};

export default NewInspection;
