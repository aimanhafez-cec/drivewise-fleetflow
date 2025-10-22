import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { QuoteWizard } from "@/components/quotes/QuoteWizard";

const NewQuote: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    document.title = id ? "Edit Quote | Core Car Rental" : "New Quote | Core Car Rental";
  }, [id]);

  return <QuoteWizard quoteId={id} />;
};

export default NewQuote;
