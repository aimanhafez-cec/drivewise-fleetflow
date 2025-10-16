import { useParams } from "react-router-dom";
import { QuoteWizard } from "@/components/quotes/QuoteWizard";

export default function QuoteView() {
  const { id } = useParams<{ id: string }>();
  
  return <QuoteWizard viewMode={true} quoteId={id} />;
}
