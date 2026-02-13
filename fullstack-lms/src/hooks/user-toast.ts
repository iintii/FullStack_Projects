import { toast } from "sonner";

// 1. Define the shape of the data returned by your Server Actions
//    (Matches the tutorial's pattern: { error: boolean, message: string })
type ActionData = {
  error: boolean;
  message: string;
};

// 2. Create the wrapper function
export function actionToast({ actionData }: { actionData: ActionData }) {
  if (actionData.error) {
    // If error is true, show a red error toast
    toast.error("Error", {
      description: actionData.message,
    });
  } else {
    // If error is false, show a green success toast
    toast.success("Success", {
      description: actionData.message,
    });
  }
}
