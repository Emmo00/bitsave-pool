import HomePage from "@/pages/Home";
import CreatePage from "./pages/CreatePlan";
import JoinedPlansPage from "./pages/JoinedPlans";
import MyPlansPage from "./pages/MyPlans";
import PlanDetailsPage from "./pages/PlanDetails";

export const routes = {
  "/": HomePage,
  "/create": CreatePage,
  "/plans/joined": JoinedPlansPage,
  "/plans/owned": MyPlansPage,
  "/plans/:id": PlanDetailsPage
};
