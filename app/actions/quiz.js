"use server";
import { Quizset } from "@/model/quizset-model";

export async function updateQuizSet(quizset, dataToUpdate) {
  try {
    await Quizset.findByIdAndUpdate(quizset, dataToUpdate);
  } catch (error) {
    throw new Error(error);
  }
}
