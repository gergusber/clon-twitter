import Head from "next/head";
import type { GetStaticProps, NextPage } from "next";
import { api } from "~/utils/api";
import superjson from 'superjson';
import { prisma } from "~/server/db";
import { appRouter } from "../api/root";
import { createServerSideHelpers } from "@trpc/react-query/server";

// wont work since i dont have the type for importing
export const generateSSGHelper = createServerSideHelpers({
  router: appRouter,
  ctx: { prisma, userId: null },
  transformer: superjson, // optional - adds superjson serialization
});
