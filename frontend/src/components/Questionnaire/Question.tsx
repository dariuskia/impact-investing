"use client";

import { useState } from "react";
import AnswerChoice from "./AnswerChoice";

interface QuestionProps {
  index: number;
  question: string;
  choices: string[];
  onClick: (questionNumber: number, answer: string) => void;
}

function Question({ index, question, choices, onClick }: QuestionProps) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="border-b border-neutral-300 py-10 last:border-0">
      <div className="pb-8">
        <h2 className="pb-1 font-sans text-sm font-medium text-neutral-500">
          QUESTION {index}
        </h2>
        <p className="font-sans text-neutral-700">{question}</p>
      </div>
      <div className="flex w-full items-center">
        <div className="w-full space-y-2">
          {choices.map((choice, choiceIndex) => (
            <AnswerChoice
              key={choiceIndex}
              choice={choice}
              selected={selected === choiceIndex}
              onClick={() => {
                setSelected(choiceIndex);
                onClick(index, choice);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Question;
