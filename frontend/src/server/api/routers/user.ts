import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

enum QuestionResponse {
  INDIFFERENT = "Indifferent",
  STRONGLY_AGREE = "Strongly Agree",
  STRONGLY_DISAGREE = "Strongly Disagree",
  DISAGREE = "Disagree",
  AGREE = "Agree",
}

type Questionnaire = Record<number, QuestionResponse>;

export const userRouter = createTRPCRouter({
  updateQuestionnaire: protectedProcedure
    .input(z.object({ questionnaire: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          questionnaire: input.questionnaire,
          onboarded: true,
        },
      });
    }),
});
