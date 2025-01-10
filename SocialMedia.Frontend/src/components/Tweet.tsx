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
import { detectAndTranslate } from "./Utility/detectAndTranslate";

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
  tweets,
}: TweetProps) => {
  const [editMode, setEditMode] = useState(false);
  const [updatedBody, setUpdatedBody] = useState("");
  const [translatedText, setTranslatedText] = useState(tweet.body);
  const [isTranslated, setIsTranslated] = useState(false);

  async function TranslateTextUsingApi() {
    // toggle for false and true, it starts at false and will hit it once
    if (!isTranslated) {
      // check to see if it's already translated, if it is, skip and just change the boolean for conditional rendering to avoid multiple api calls.
      if (translatedText == tweet.body) {
        const translationFromApi = await detectAndTranslate(tweet.body, "en");
        setTranslatedText(`Translation: ${translationFromApi}`);
      }
      setIsTranslated(true);
    } else {
      setIsTranslated(false);
    }
  }

  // recursive rendering of replies
  const replies = tweets.filter((r) => r.parentId === tweet.id);

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
      <CardContent className="flex-col">
        {/* If not in edit mode, display tweet body. Else show the input. */}
        {!editMode ? (
          <>
            <p className="text-sm text-white">
              {isTranslated ? translatedText : tweet.body}
            </p>
            <p className="text-xs text-slate-300">
              {new Date(tweet.createdAt).toLocaleString()}
            </p>
            <a
              className="block pt-2 text-blue-500 hover:underline"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                TranslateTextUsingApi();
              }}
            >
              {isTranslated ? "Show Original" : "Click here to translate"}
            </a>
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

      <CardFooter className="flex-wrap gap-2">
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
            tweets={tweets}
          />
        ))}
      </div>
    </Card>
  );
};

export default Tweet;
