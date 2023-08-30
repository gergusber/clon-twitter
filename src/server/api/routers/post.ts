import { clerkClient } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl
  }
}

export const schemas = {
  content: z.object({
    content: z.string().emoji().min(1).max(280)
  }),
}

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    const users = (await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100
    })).map(filterUserForClient)

    return posts.map(post => {
      const author = users.find(usr => usr.id === post.authorId)

      if (!author?.username) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: 'Author for post not Found.' })

      return {
        post,
        author: {
          ...author,
          username: author.username
        }
      }
    })
  }),

  create: privateProcedure.input(schemas.content).mutation(async ({ ctx, input }) => {
    const authorId = ctx.userId;
    return await ctx.prisma.post.create({
      data: {
        content: input.content,
        authorId
      }
    })
  })
});

