import HomePage from "@/pages/Home";
import CreatePage from "./pages/CreatePlan";
import JoinedPlansPage from "./pages/JoinedPlans";
import MyPlansPage from "./pages/MyPlans";
import PlanDetailsPage from "./pages/PlanDetails";
import PlansPage from "./pages/Plans";

export const routes = {
  "/": HomePage,
  "/create": CreatePage,
  "/plans": PlansPage,
  "/plans/joined": JoinedPlansPage,
  "/plans/owned": MyPlansPage,
  "/plans/my-plans": MyPlansPage,
  "/plans/:id": PlanDetailsPage,
};
