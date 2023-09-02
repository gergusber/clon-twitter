import Head from "next/head";
import type { GetStaticProps, NextPage } from "next";
import { api } from "~/utils/api";
import { createServerSideHelpers } from '@trpc/react-query/server';
import superjson from 'superjson';
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import { PageLayout } from "~/components/layout";
import PostsView from "~/components/Postview";


const SinglePost: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.posts.getByPostId.useQuery({ id });

  if (!data) return <div />
  const content = `${data.post.content} -  @${data.author.username}`;
  return (
    <>
      <Head>
        <title>{content}</title>
        <meta name="description" content="💩" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <PageLayout>
        <PostsView {...data} />
      </PageLayout >
    </>
  );
}

export const getStaticPaths = () => {
  return {
    paths: ["/post/clly5gco00003gmbf6atle1nu"],
    fallback: "blocking"
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const id = context.params?.id;

  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

  if (typeof id !== "string") {
    throw new Error("no Id")
  }
  await ssg.posts.getByPostId.prefetch({ id })

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    }
  }
}

export default SinglePost