import { getAllQuizSets } from "@/queries/quizzes";
import { requireRole } from "@/lib/require-role";
import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";

const QuizSets = async () => {
  await requireRole("instructor");
  const quzSetsall = await getAllQuizSets();
  const mappedQuizSets = quzSetsall.map((q) => {
    return {
      id: q.id,
      title: q.title,
      isPublished: q.active,
      totalQuiz: q.quizIds?.length ?? 0,
    };
  });

  //console.log(mappedQuizSets);
  return (
    <div className="p-6">
      <DataTable columns={columns} data={mappedQuizSets} />
    </div>
  );
};

export default QuizSets;