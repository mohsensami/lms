/**
 * `assessment.assessments` is a JSON array shaped like:
 *   [{ quizId, attempted, options: [{ option, isCorrect, isSelected }] }, ...]
 * (see app/actions/quiz.js -> addQuizAssessment). A question counts as
 * "correct" when the option the student selected is the correct one.
 */
export function getQuizScore(assessment) {
    const items = assessment?.assessments;
    if (!Array.isArray(items) || items.length === 0) {
        return { correct: 0, total: 0, percentage: 0 };
    }

    const total = items.length;
    const correct = items.filter((item) =>
        (item.options || []).some((option) => option.isSelected && option.isCorrect),
    ).length;

    return {
        correct,
        total,
        percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
}
