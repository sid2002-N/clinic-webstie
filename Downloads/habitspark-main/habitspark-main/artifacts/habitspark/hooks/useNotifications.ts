import { useEffect } from "react";
import { setupInitialNotifications } from "@/utils/notifications";

export function useNotifications() {
  useEffect(() => {
    setupInitialNotifications();
  }, []);
}
