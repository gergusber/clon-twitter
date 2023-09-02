import Head from "next/head";
import type { GetStaticProps, NextPage } from "next";
import { api } from "~/utils/api";
import { createServerSideHelpers } from '@trpc/react-query/server';
import superjson from 'superjson';
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import { PageLayout } from "~/components/layout";
import Image from 'next/image'
import { LoadingPage } from "~/components/loading";
import PostsView from "~/components/Postview";

// type PageProps = InferGetStaticPropsType<typeof getStaticProps>; // like this we can infer what is comming from getStaticProps

const ProfileFeed = (props: { userId: string }) => {

  const { data, isLoading } = api.posts.getPostByUserId.useQuery({ userId: props.userId })

  if (isLoading) return <LoadingPage />

  if (!data || data.length === 0) {
    return <div>User has not posts.</div>
  }

  return (
    <div className="flex flex-col">
      {data.map((fullpost) => (
      <PostsView {...fullpost} key={fullpost.post.id} />
    ))}
  </div>
  )

}


const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({ username });

  if (!data) return <div />
  const showUsrName = `@${data.username ?? ""}`;
  return (
    <>
      <Head>
        <title>{showUsrName}</title>
        <meta name="description" content="💩" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <PageLayout>
        <div className="relative  h-36 border-slate-400 bg-slate-600">
          <Image src={data.profileImageUrl}
            alt={`${showUsrName}'s profile pic`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>

        <div className="h-[64px]"></div>

        <div className="p-4 b ml-4 text-2xl font-bold">{showUsrName}</div>

        <div className="border-b border-slate-400 w-full"></div>

        <ProfileFeed userId={data.id} />
      </PageLayout >
    </>
  );
}

export const getStaticPaths = () => {
  return {
    paths: ["/@gergusber"],
    fallback: "blocking"
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const slug = context.params?.slug;

  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

  if (typeof slug !== "string") {
    throw new Error("no slug")
  }

  const username = slug.replace('@', '');

  await ssg.profile.getUserByUsername.prefetch({ username })

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    }
  }
}

export default ProfilePage