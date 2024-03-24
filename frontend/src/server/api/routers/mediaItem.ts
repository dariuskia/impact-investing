import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const mediaItemRouter = createTRPCRouter({
  getMediaItems: protectedProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
      return ctx.db.mediaItem.findMany({
        where: { userId: ctx.session.user.id },
      });
    }),
  deleteMediaItem: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.mediaItem.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),
});
