import Head from "next/head";
import { useUser } from "@clerk/nextjs";
 
 
export default function PostDetailPage() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
 
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="Post" content="Post page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center ">
        <div> Post view </div>
      </main>
    </>
  );
}
