import Tweet from "./Tweet";
import { TweetFeedProps } from "@/vite-env";
import { Input } from "./ui/input";
import { useState } from "react";

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
  const [input, setinput] = useState("");

  function handleSubmit() {
    console.log(input);
  }

  return (
    <div className="space-y-4">
      <Input
        className="border-slate-600 rounded-lg mb-4"
        type="text"
        placeholder="Search Tweets"
        onChange={(e) => setinput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />

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
