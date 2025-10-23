import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { MasterAgreementWizard } from "@/components/master-agreements/MasterAgreementWizard";

const MasterAgreementView: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    document.title = "View Master Agreement | Core Car Rental";
  }, []);

  return <MasterAgreementWizard agreementId={id} viewMode={true} />;
};

export default MasterAgreementView;
