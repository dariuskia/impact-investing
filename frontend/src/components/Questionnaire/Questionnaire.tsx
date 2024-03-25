"use client";

import { questionsList } from "~/components/Questionnaire/QuestionsList";
import Question from "./Question";
import { Button } from "../ui/button";
import { useState } from "react";
import { api } from "~/trpc/react";
import { redirect } from "next/navigation";
// import { useRouter } from "next/router";

// interface AnswersState {
//   "1": string;
//   "2": string;
//   "3": string;
//   "4": string;
//   "5": string;
//   "6": string;
//   "7": string;
//   "8": string;
//   "9": string;
//   "10": string;
// }

const initialAnswers: Record<string, string> = {
  "1": "",
  "2": "",
  "3": "",
  "4": "",
  "5": "",
  "6": "",
  "7": "",
  "8": "",
  "9": "",
  "10": "",
};

function Questionnaire() {
  const [answers, setAnswers] =
    useState<Record<string, string>>(initialAnswers);

  // const router = useRouter();

  const updateAnswer = (questionNumber: number, answer: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionNumber.toString()]: answer,
    }));
  };

  const isDisabled = Object.values(answers).some((answer) => answer === null);

  const updateQuestionnaire = api.user.updateQuestionnaire.useMutation({});

  const submitAnswers = async () => {
    updateQuestionnaire.mutate({ questionnaire: JSON.stringify(answers) });

    // await router.push("/dashboard/home");
  };

  return (
    <div className="">
      {questionsList.map((question, index) => (
        <Question
          key={index}
          index={index + 1}
          question={question.question}
          choices={question.choices}
          onClick={updateAnswer}
        />
      ))}
      <Button
        type="button"
        className="mt-10 w-full"
        onClick={submitAnswers}
        disabled={isDisabled}
      >
        Submit Answers
      </Button>
    </div>
  );
}

export default Questionnaire;
