import Tweet from "./Tweet";
import { TweetFeedProps } from "@/vite-env";
import { Input } from "./ui/input";
import { useState, useMemo } from "react";
import { Button } from "./ui/button";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Number of tweets per page

  // Filter tweets based on search term
  const filteredTweets = useMemo(() => {
    return Array.isArray(tweets)
      ? tweets
          .filter((tweet) => !tweet.parentId)
          .filter((tweet) => {
            const bodyMatch = tweet.body
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
            const userMatch = tweet.user?.username
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase());
            return bodyMatch || userMatch;
          })
      : [];
  }, [tweets, searchTerm]);

  // Paginate filtered tweets
  const paginatedTweets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredTweets.slice(startIndex, endIndex);
  }, [filteredTweets, currentPage, pageSize]);

  const totalPages = useMemo(
    () => Math.ceil(filteredTweets.length / pageSize),
    [filteredTweets.length, pageSize]
  );

  // Handle search submission (optional)
  const handleSubmit = () => {
    setCurrentPage(1); // Reset to the first page on search
  };

  // Pagination controls
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

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

      {/* Paginated Tweets */}
      {paginatedTweets.map((tweet, index) => (
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
          isFirst={index === 0}
        />
      ))}

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <Button
          variant="secondary"
          className="bg-slate-900 text-white hover:text-slate-800 px-4 py-2 rounded"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="secondary"
          className="bg-slate-900 text-white hover:text-slate-800 px-4 py-2 rounded"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default TweetFeed;
