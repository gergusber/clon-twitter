import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";


export const schemas = {
  filter: z.object({
    username: z.string()
  }),
}

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(schemas.filter)
    .query(async ({ input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.username]
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found!'
        })
      }

      return filterUserForClient(user);
    }),
});

