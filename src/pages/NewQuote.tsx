import React, { useEffect } from "react";
import { QuoteWizard } from "@/components/quotes/QuoteWizard";

const NewQuote: React.FC = () => {
  useEffect(() => {
    document.title = "New Quote | Core Car Rental";
  }, []);

  return <QuoteWizard />;
};

export default NewQuote;
