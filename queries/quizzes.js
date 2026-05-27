import { replaceMongoIdInArray } from "@/lib/convertData";
import { Quizset } from "@/model/quizset-model";

export async function getAllQuizSets(excludeUnPublished) {
  try {
    let quizSets = [];
    if (excludeUnPublished) {
      quizSets = await Quizset.find({ active: true }).lean();
    } else {
      quizSets = await Quizset.find().lean();
    }
    return replaceMongoIdInArray(quizSets);
  } catch (error) {
    throw new Error(error);
  }
}
