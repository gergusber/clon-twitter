import Head from "next/head";
import { useUser } from "@clerk/nextjs";
 
 
export default function PostDetailPage() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
 
  return (
    <>
    <Head>
        <title>TweemogiApp</title>
        <meta name="description" content="💩" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center ">
        <div> Post view </div>
      </main>
    </>
  );
}
