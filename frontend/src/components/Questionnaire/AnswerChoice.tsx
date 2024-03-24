"use client";

import { cn } from "~/lib/utils";

interface AnswerChoiceProps {
  choice: string;
  selected: boolean;
  onClick: () => void;
}

function AnswerChoice({ choice, selected, onClick }: AnswerChoiceProps) {
  return (
    <button
      className={cn(
        "flex w-full cursor-pointer select-none items-center space-x-2 rounded-lg border bg-transparent px-4 py-2 text-left",
        {
          "bg-primary/10 border-primary": selected,
          "border-neutral-200": !selected,
        },
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full border transition-colors duration-150",
          {
            "border-primary": selected,
            "border-neutral-200": !selected,
          },
        )}
      >
        <div
          className={cn("h-3 w-3 rounded-full", {
            "bg-primary": selected,
            "bg-transparent": !selected,
          })}
        ></div>
      </div>
      <p className="">{choice}</p>
    </button>
  );
}

export default AnswerChoice;
