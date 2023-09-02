
import Image from 'next/image'
import type { RouterOutputs } from '~/utils/api'
import dayjs from "dayjs";
import Link from "next/link";
import relativetime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativetime)


type PostWithUser = RouterOutputs["posts"]["getAll"][number]
const PostsView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="flex border-b border-slate-400 p-4 gap-3">
      <Image src={author.profileImageUrl}
        alt={`@${author.username}'s profile pic`}
        width={55}
        height={55}
        className="rounded-full"
      />

      <div className=" flex flex-col">
        <div className="flex text-slate-400 font-bold gap-1">
          <Link href={`/@${author.username}`} >
            <span>{`@${author.username}`}</span>
          </Link>

          <Link href={`/post/${post.id}`} >
            <span className="font-thin">{`  · ${dayjs(post.createdAt).fromNow()}`}</span>
          </Link>
        </div>

        <Link href={`/post/${post.id}`} >
          <span className="text-2xl">{post.content}</span>
        </Link>
      </div>
    </div>
  )
}

export default PostsView;