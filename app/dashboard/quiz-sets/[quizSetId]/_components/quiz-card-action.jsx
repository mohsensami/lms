"use client";
import React, { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Delete } from "lucide-react";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";

export const QuizCardActions = ({ quiz, quizSetId }) => {
  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();
    console.log(action);
  }

  return (
    <form onSubmit={handleSubmit}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setAction("edit-quiz")}
        disabled={loading}
      >
        <Pencil className="w-3 mr-1" /> Edit
      </Button>
      <Button
        className="text-destructive"
        variant="ghost"
        size="sm"
        onClick={() => setAction("delete-quiz")}
        disabled={loading}
      >
        <Trash className="w-3 mr-1" /> Delete
      </Button>
    </form>
  );
};
