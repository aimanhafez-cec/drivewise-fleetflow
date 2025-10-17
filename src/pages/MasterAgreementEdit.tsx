import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { MasterAgreementWizard } from "@/components/master-agreements/MasterAgreementWizard";

const MasterAgreementEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    document.title = "Edit Master Agreement | Core Car Rental";
  }, []);

  return <MasterAgreementWizard agreementId={id} isEditMode={true} />;
};

export default MasterAgreementEdit;
