import { clerkClient } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl
  }
}


// Create a new ratelimiter, that allows 3 requests per 1 minute
const rateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

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

    // restrict: amount of requests. 3 req / 1min.
    const { success } = await rateLimit.limit(authorId)
    if (!success) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS"
      })
    }

    return await ctx.prisma.post.create({
      data: {
        content: input.content,
        authorId
      }
    })
  })
});

