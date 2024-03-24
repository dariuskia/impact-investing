import { z } from "zod";
import * as cheerio from "cheerio";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// enum QuestionResponse {
//   INDIFFERENT = "Indifferent",
//   STRONGLY_AGREE = "Strongly Agree",
//   STRONGLY_DISAGREE = "Strongly Disagree",
//   DISAGREE = "Disagree",
//   AGREE = "Agree",
// }

// type Questionnaire = Record<number, QuestionResponse>;

interface TranscriptionData {
  title: string;
  transcription: string;
}

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
      if (input.url.includes("youtube.com")) {
        const response = await fetch(
          "https://superb-mighty-tortoise.ngrok-free.app/transcript",
          {
            method: "POST",
            body: JSON.stringify({ videoURL: input.url }),
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const jsonData = (await response.json()) as TranscriptionData;

        await ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: {
            mediaItems: {
              create: {
                title: jsonData.title,
                type: "video",
                note: input.note,
                url: input.url,
                content: jsonData.transcription,
              },
            },
          },
        });
      } else {
        const response = await fetch(input.url);
        const html = await response.text();
        const $ = cheerio.load(html);

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

        await ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: {
            mediaItems: {
              create: {
                title: pageTitle,
                type: "article",
                note: input.note,
                url: input.url,
                content: htmlString,
              },
            },
          },
        });

        return { success: true, htmlString };
      }
    }),
});
