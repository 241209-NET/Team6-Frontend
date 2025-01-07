import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import TweetFeed from "./components/TweetFeed";
import { Tweet, User } from "./vite-env";
import {
  initializeSignalRConnection,
  getSignalRConnection,
} from "./components/Utility/singalRConnection";

const baseURL = "http://localhost:5108";

const App = () => {
  // 1) Login/Register states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // 2) Tweet-related states
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [newTweet, setNewTweet] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [replyParentId, setReplyParentId] = useState<number | null>(null);

  // 3) Login function
  const handleLogin = async () => {
    try {
      const payload = { username, password };
      const response = await axios.post<User>(
        `${baseURL}/api/User/login`,
        payload
      );
      setCurrentUser(response.data);

      //Fetching after successful login
      fetchTweets();
    } catch (error) {
      console.error("Login error:", error);
      alert("Invalid credentials or user not found.");
    }
  };

  // 4) Register function
  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) return;
    try {
      // POST /api/User with { username, password }
      const payload = { username, password };
      const response = await axios.post<User>(`${baseURL}/api/User`, payload);
      setCurrentUser(response.data);
      setUsername("");
      setPassword("");

      //running fetch
      fetchTweets();
    } catch (error) {
      console.error("Register error:", error);
      alert("Error creating user. Try a different username.");
    }
  };

  // 5) Axios calls for tweets
  const fetchTweets = async () => {
    try {
      const response = await axios.get<Tweet[]>(`${baseURL}/api/Tweet`);
      setTweets(response.data);
    } catch (error) {
      console.error("Error fetching tweets:", error);
    }
  };

  const handlePostTweet = async () => {
    if (!newTweet.trim() || !currentUser) return;
    const payload = { body: newTweet, userId: currentUser.id };
    try {
      await axios.post<Tweet>(`${baseURL}/api/Tweet`, payload);
      setNewTweet(""); // rely on SignalR for the actual insert
    } catch (error) {
      console.error("Error posting tweet:", error);
    }
  };

  const handlePostReply = async (parentId: number) => {
    if (!replyBody.trim() || !currentUser) return;
    const payload = { body: replyBody, userId: currentUser.id, parentId };
    try {
      await axios.post<Tweet>(`${baseURL}/api/Tweet`, payload);
      setReplyBody("");
      setReplyParentId(null);
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  const handleLike = async (id: number) => {
    try {
      await axios.post(`${baseURL}/api/Tweet/${id}/Like`);
    } catch (error) {
      console.error("Error liking tweet:", error);
    }
  };

  const handleDislike = async (id: number) => {
    try {
      await axios.post(`${baseURL}/api/Tweet/${id}/Unlike`);
    } catch (error) {
      console.error("Error disliking tweet:", error);
    }
  };

  const handleDeleteTweet = async (id: number) => {
    try {
      await axios.delete(`${baseURL}/api/Tweet/${id}`);
    } catch (error) {
      console.error("Error deleting tweet:", error);
    }
  };

  const handleUpdateTweet = async (id: number, newBody: string) => {
    try {
      await axios.put(
        `${baseURL}/api/Tweet/${id}?newBody=${encodeURIComponent(newBody)}`
      );
    } catch (error) {
      console.error("Error updating tweet:", error);
    }
  };

  // ---------------------------
  // 6) SignalR Handlers
  // ---------------------------
  const handleReceiveTweet = (tweet: Tweet) => {
    console.log("New tweet received via SignalR:", tweet);
    setTweets((prev) => [tweet, ...prev]);
  };

  const handleLikeTweet = (tweetId: number) => {
    console.log("Tweet liked via SignalR:", tweetId);
    setTweets((prev) =>
      prev.map((t) => (t.id === tweetId ? { ...t, likes: t.likes + 1 } : t))
    );
  };

  const handleUnlikeTweet = (tweetId: number) => {
    console.log("Tweet disliked via SignalR:", tweetId);
    setTweets((prev) =>
      prev.map((t) => (t.id === tweetId ? { ...t, likes: t.likes - 1 } : t))
    );
  };

  const handleDeleteTweetSignalR = (tweetId: number) => {
    console.log("Tweet deleted via SignalR:", tweetId);
    setTweets((prev) => prev.filter((t) => t.id !== tweetId));
  };

  const handleUpdateTweetSignalR = (updatedTweet: Tweet) => {
    console.log("Tweet updated via SignalR:", updatedTweet);
    setTweets((prev) =>
      prev.map((t) => (t.id === updatedTweet.id ? updatedTweet : t))
    );
  };

  useEffect(() => {
    initializeSignalRConnection({
      onReceiveTweet: handleReceiveTweet,
      onLikeTweet: handleLikeTweet,
      onUnlikeTweet: handleUnlikeTweet,
      onDeleteTweet: handleDeleteTweetSignalR,
      onUpdateTweet: handleUpdateTweetSignalR,
    });
    fetchTweets();

    return () => {
      const connection = getSignalRConnection();
      if (connection) {
        connection.off("ReceiveTweet", handleReceiveTweet);
        connection.off("LikeTweet", handleLikeTweet);
        connection.off("UnlikeTweet", handleUnlikeTweet);
        connection.off("DeleteTweet", handleDeleteTweetSignalR);
        connection.off("UpdateTweet", handleUpdateTweetSignalR);
        connection.stop();
      }
    };
  }, []);

  // If the user is not logged in, show a combined Login / Register UI
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-800 text-white flex items-center justify-center">
        <div className="bg-slate-700 p-6 rounded-md">
          <h2 className="text-xl mb-4">Login or Register</h2>
          <input
            className="w-full mb-2 p-2 rounded-md text-black"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="w-full mb-2 p-2 rounded-md text-black"
            placeholder="Enter password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex space-x-2">
            <Button onClick={handleLogin}>Login</Button>
            <Button variant="secondary" onClick={handleRegister}>
              Register
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If the user is logged in, show tweets
  return (
    <div className="min-h-screen bg-slate-800 text-white">
      {/* Navbar */}
      <div className="bg-slate-600 border-b border-slate-700">
        <div className="w-full flex justify-between items-center py-4 px-4">
          <h1 className="text-xl font-bold text-white">
            Cuong's Social Media APP
          </h1>
          <div>
            <span className="mr-3">Logged in as: {currentUser.username}</span>
            <Button
              variant="secondary"
              onClick={() => {
                setCurrentUser(null);
                setTweets([]);
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-6 px-4">
        {/* New tweet box */}
        <Card className="mb-6 bg-slate-800 border-slate-600">
          <CardContent>
            <Textarea
              className="border-slate-600 placeholder:text-slate-300 text-white mt-5"
              placeholder="What's happening?"
              value={newTweet}
              onChange={(e) => setNewTweet(e.target.value)}
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handlePostTweet}>Post Tweet</Button>
          </CardFooter>
        </Card>

        <TweetFeed
          tweets={tweets}
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
        />
      </div>
    </div>
  );
};

export default App;
