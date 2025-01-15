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
  //const [input, setinput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  function handleSubmit() {
    console.log("Searching for:", searchTerm);
  }

  const filteredTweets = Array.isArray(tweets)
    ? tweets
        .filter((tweet) => !tweet.parentId)
        .filter((tweet) => {
          // Convert text to lower case for case-insensitive match
          const bodyMatch = tweet.body
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const userMatch = tweet.user?.username
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());

          return bodyMatch || userMatch;
        })
    : [];

  return (
    <div className="space-y-4">
      <Input
        className="border-slate-600 rounded-lg mb-4"
        type="text"
        placeholder="Search Tweets"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />

      {/* adding an array check so if some reason tweets is null, it doesn't do stupid things */}
      {filteredTweets.map((tweet, index) => (
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
          tweets={tweets}
          // optional "isFirst" prop if you want to animate the first tweet
          isFirst={index === 0}
            />
          ))}
    </div>
  );
};

export default TweetFeed;
