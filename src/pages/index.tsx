import Head from "next/head";
import { SignIn, SignOutButton, SignInButton, useUser } from "@clerk/nextjs";
import Image from 'next/image'
import { api } from "~/utils/api";
import type { RouterOutputs } from '~/utils/api'
import dayjs from "dayjs";
import relativetime from 'dayjs/plugin/relativeTime'
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { PageLayout } from "~/components/layout";
import PostsView from "~/components/Postview";


dayjs.extend(relativetime)

const CreatePostWizzard = () => {
  const { user } = useUser();
  const [input, setInput] = useState<string>("");
  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput('');
      void ctx.posts.getAll.invalidate();
      toast.success("Posted.");
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        return toast.error(errorMessage[0]!);
      }
      toast.error("Failed to post! Please try again later.");
    }
  });

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
        className="grow bg-transparent outline-none bg-red-200"
        value={input}
        type="text"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input })
            }
          }
        }}
        onChange={(e) => setInput(e.target.value)} />

      {input !== "" && !isPosting && (
        <button disabled={isPosting} onClick={() => mutate({ content: input })}>
          Post
        </button>
      )}

      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  )
}


const Feed = () => {
  const { data, isLoading: postLoading } = api.posts.getAll.useQuery();

  if (postLoading) return <LoadingPage />

  if (!data) return <div>Something went wrong.</div>

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
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
        <title>TweemogiApp</title>
        <meta name="description" content="💩" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        {isSignedIn && (
          <div className="flex w-full ">
            <SignOutButton />
          </div>
        )}
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

      </PageLayout>
    </>
  );
}
