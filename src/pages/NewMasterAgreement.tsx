import React, { useEffect } from "react";
import { MasterAgreementWizard } from "@/components/master-agreements/MasterAgreementWizard";

const NewMasterAgreement: React.FC = () => {
  useEffect(() => {
    document.title = "New Master Agreement | Core Car Rental";
  }, []);

  return <MasterAgreementWizard />;
};

export default NewMasterAgreement;
