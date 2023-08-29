import Head from "next/head";
import Link from "next/link";
import { SignIn, SignOutButton, SignInButton, useUser } from "@clerk/nextjs";
import Image from 'next/image'
import { api } from "~/utils/api";
import type { RouterOutputs } from '~/utils/api'
import dayjs from "dayjs";
import relativetime from 'dayjs/plugin/relativeTime'
import { LoadingPage, LoadingSpinner } from "~/components/loading";


dayjs.extend(relativetime)

const CreatePostWizzard = () => {
  const { user } = useUser();
  console.log(user);
  if (!user) return null;

  return (
    <div className="flex w-full gap-3">
      <Image src={user.profileImageUrl}
        alt={`@${user.username}'s profile pic`}
        width={55}
        height={55}
        className="rounded-full" />
      <input
        placeholder="Type some emogis"
        className="grow bg-transparent outline-none bg-red-200" />
    </div>
  )
}

type PostWithUser = RouterOutputs["posts"]["getAll"][number]
const PostsView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="flex p-8 border-b border-slate-400 p-4 gap-3">
      <Image src={author.profileImageUrl}
        alt={`@${author.username}'s profile pic`}
        width={55}
        height={55}
        className="rounded-full"
      />

      <div className=" flex flex-col">

        <div className="flex text-slate-400 font-bold gap-1">
          <span>{`@${author.username}`}</span>
          <span className="font-thin">{`  · ${dayjs(post.createdAt).fromNow()}`}</span>
        </div>

        <span>{post.content}</span>
      </div>
    </div>
  )
}

const Feed = () => {
  const { data, isLoading: postLoading } = api.posts.getAll.useQuery();

  if (postLoading) return <LoadingPage />

  if (!data) return <div>Something went wrong.</div>

  return (
    <div className="flex flex-col">
      {[...data, ...data]?.map((fullPost) => (
        <PostsView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  )
}

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  api.posts.getAll.useQuery(); // start fetching asap 

  if (!userLoaded) return <div />; // return empty div if user isnt loaded.


  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center ">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl ">

          <div className="flex border-b border-slate-400 p-4">
            {!isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}

            {isSignedIn && (
              <div className="flex w-full ">
                <CreatePostWizzard />
              </div>
            )}
          </div>

          <Feed />

        </div>
      </main>
    </>
  );
}
