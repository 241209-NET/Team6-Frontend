import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { TweetProps } from "@/vite-env";

const Tweet = ({
  tweet,
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
  replies,
}: TweetProps) => {
  const [editMode, setEditMode] = useState(false);
  const [updatedBody, setUpdatedBody] = useState("");

  // Show an update and delete button if user owns this tweet
  const canUpdate = currentUser && currentUser.id === tweet.userId;

  return (
    <Card
      key={tweet.id}
      className="shadow-sm bg-slate-800 text-white border-slate-600"
    >
      <CardHeader>
        <CardTitle>{tweet.user?.username || "Anonymous"}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* If not in edit mode, display tweet body. Else show the input. */}
        {!editMode ? (
          <>
            <p className="text-sm text-white">{tweet.body}</p>
            <p className="text-xs text-slate-300">
              {new Date(tweet.createdAt).toLocaleString()}
            </p>
          </>
        ) : (
          <div className="flex flex-col space-y-2">
            <Textarea
              className="text-white"
              value={updatedBody}
              onChange={(e) => setUpdatedBody(e.target.value)}
            />
            <Button
              onClick={() => {
                // Call handleUpdateTweet with the new body
                handleUpdateTweet(tweet.id, updatedBody);
                setEditMode(false);
              }}
            >
              Save Update
            </Button>
            <Button onClick={() => setEditMode(false)}>Cancel</Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-start space-x-2">
        {/* Like and Dislike buttons */}
        <Button onClick={() => handleLike(tweet.id)}>
          Like ({tweet.likes})
        </Button>
        <Button variant="secondary" onClick={() => handleDislike(tweet.id)}>
          Dislike
        </Button>

        {/* Reply button */}
        <Button onClick={() => setReplyParentId(tweet.id)}>Reply</Button>

        {/* Update only if user owns tweet */}
        {canUpdate && !editMode && (
          <Button
            variant="secondary"
            onClick={() => {
              setEditMode(true);
              setUpdatedBody(tweet.body);
            }}
          >
            Update
          </Button>
        )}

        {/* Delete only if user owns tweet  */}
        {canUpdate && (
          <Button
            variant="destructive"
            onClick={() => handleDeleteTweet(tweet.id)}
          >
            Delete
          </Button>
        )}
      </CardFooter>

      {/* If replying */}
      {replyParentId === tweet.id && (
        <div className="mt-2 p-4">
          <Textarea
            className="text-white"
            placeholder="Write your reply..."
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
          />
          <Button onClick={() => handlePostReply(tweet.id)} className="mt-2">
            Post Reply
          </Button>
        </div>
      )}

      {/* Render replies */}
      <div className="ml-6 mt-4 space-y-4">
        {replies.map((r) => (
          <Tweet
            key={r.id}
            tweet={r}
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
            replies={[]}
          />
        ))}
      </div>
    </Card>
  );
};

export default Tweet;
