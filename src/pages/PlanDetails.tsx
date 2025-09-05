import { PlanDetailsView } from "@/components/plan-details-view";
import { useParams } from "react-router-dom";

export default function PlanDetailsPage() {
  const params = useParams<{ id: string }>();
  if (!params.id) {
    return <div>Plan ID is required</div>;
  }
  return <PlanDetailsView planId={params.id} />;
}
