import AddQuizSetForm from "../_components/add-quizset-form";
import { requireRole } from "@/lib/require-role";

const AddQuizSet = async () => {
  await requireRole("admin");
  return (
    <div>
      <AddQuizSetForm />
    </div>
  );
};

export default AddQuizSet;
