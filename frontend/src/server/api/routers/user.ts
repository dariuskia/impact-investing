import { z } from "zod";
import * as cheerio from "cheerio";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

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
  addMediaItem: protectedProcedure
    .input(z.object({ url: z.string(), note: z.string() }))
    .mutation(async ({ ctx, input }) => {
      console.log(input.url, input.note);
      const response = await fetch(input.url);
      const html = await response.text();
      const $ = cheerio.load(html);

      console.log("workd past here");

      const elements = $(
        "article, p, div:has(*[class*='article']), span:has(*[class*='article']), main:has(*[class*='article'])",
      );

      // Use map to get the HTML of each element, and join them together into a single string:
      const htmlString = elements
        .map(function () {
          return $(this).html();
        })
        .get()
        .join("")
        .trim();

      const pageTitle = $("title").text();

      console.log("workd past here");

      await ctx.db.mediaItem.create({
        data: {
          title: pageTitle,
          type: "article",
          description: "",
          note: input.note,
          url: input.url,
          user: { connect: { id: ctx.session.user.id } },
          content: htmlString,
        },
      });

      console.log("workd past here");

      // Append this media item to the user's media items:
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          mediaItems: {
            create: {
              title: pageTitle,
              type: "article",
              description: "",
              note: input.note,
              url: input.url,
              content: htmlString,
            },
          },
        },
      });

      return { success: true, htmlString };
    }),
});
