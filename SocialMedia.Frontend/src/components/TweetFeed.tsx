import Tweet from "./Tweet";
import { TweetFeedProps } from "@/vite-env";

const TweetFeed = ({
  tweets,
  currentUser,
  handleLike,
  handleDislike,
  setReplyParentId,
  handlePostReply,
  handleDeleteTweet,
  handleUpdateTweet,
  replyParentId,
  replyBody,
  setReplyBody,
}: TweetFeedProps) => {
  return (
    <div className="space-y-4">
      {tweets
        .filter((tweet) => !tweet.parentId)
        .map((tweet) => (
          <Tweet
            key={tweet.id}
            tweet={tweet}
            currentUser={currentUser}
            handleLike={handleLike}
            handleDislike={handleDislike}
            setReplyParentId={setReplyParentId}
            handlePostReply={handlePostReply}
            handleDeleteTweet={handleDeleteTweet}
            handleUpdateTweet={handleUpdateTweet}
            replyParentId={replyParentId}
            replyBody={replyBody}
            setReplyBody={setReplyBody}
            replies={tweets.filter((r) => r.parentId === tweet.id)}
          />
        ))}
    </div>
  );
};

export default TweetFeed;
