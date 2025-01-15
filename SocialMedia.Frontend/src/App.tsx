import { useEffect, useState, useMemo } from "react";
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

const baseURL = import.meta.env.VITE_BASE_URL;

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
  // Store **all** tweets in 'allTweets'
  const [allTweets, setAllTweets] = useState<Tweet[]>([]);

  // 2a) PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5); // You can customize

  const currentPageTweets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return allTweets.slice(startIndex, endIndex);
  }, [allTweets, currentPage, pageSize]);

  // Keep 'tweets' in sync with the current page’s tweets
  useEffect(() => {
    setTweets(currentPageTweets);
  }, [currentPageTweets]);

  // 3) Login function
  const handleLogin = async () => {
    try {
      const payload = { username, password };

      // Send login request to the backend
      const response = await axios.post<{ token: string; user: User }>(
        `${baseURL}/api/User/login`,
        payload
      );

      // Log the response to debug
      console.log("Login response:", response.data);

      // Destructure the token and user
      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Invalid login response");
      }

      // Store the token in localStorage
      localStorage.setItem("token", token);

      // Set the current user
      setCurrentUser(user);

      // Fetch tweets after login
      //fetchTweets();
      fetchAllTweets(); 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Login error:", error);
      alert(
        error.response?.data?.message ||
          "Invalid credentials or user not found."
      );
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
      //fetchTweets();
      fetchAllTweets(); 
    } catch (error) {
      console.error("Register error:", error);
      alert("Error creating user. Try a different username.");
    }
  };

  // 5) Axios calls for tweets
  //const fetchTweets = async () => {
    const fetchAllTweets = async () => {
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
  // 6) SignalR Handlers (updating allTweets instead of just tweets for pagination update)
  // ---------------------------
  const handleReceiveTweet = (tweet: Tweet) => {
    console.log("New tweet received via SignalR:", tweet);
    //setTweets((prev) => [tweet, ...prev]);
    setAllTweets((prev) => [tweet, ...prev]);
  };

  const handleLikeTweet = (tweetId: number) => {
    console.log("Tweet liked via SignalR:", tweetId);
    //setTweets((prev) =>
    setAllTweets((prev) =>
      prev.map((t) => (t.id === tweetId ? { ...t, likes: t.likes + 1 } : t))
    );
  };

  const handleUnlikeTweet = (tweetId: number) => {
    console.log("Tweet disliked via SignalR:", tweetId);
    //setTweets((prev) =>
    setAllTweets((prev) =>
      prev.map((t) => (t.id === tweetId ? { ...t, likes: t.likes - 1 } : t))
    );
  };

  const handleDeleteTweetSignalR = (tweetId: number) => {
    console.log("Tweet deleted via SignalR:", tweetId);
    //setTweets((prev) => prev.filter((t) => t.id !== tweetId));
    setAllTweets((prev) => prev.filter((t) => t.id !== tweetId));
  };

  const handleUpdateTweetSignalR = (updatedTweet: Tweet) => {
    console.log("Tweet updated via SignalR:", updatedTweet);
    //setTweets((prev) =>
    setAllTweets((prev) =>
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

    const autoLogin = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Fetch user details using the new "current" endpoint
          const userResponse = await axios.get<User>(
            `${baseURL}/api/User/current`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          // Set the current user and fetch tweets
          setCurrentUser(userResponse.data);
          //fetchTweets(); // Fetch tweets after auto-login
          fetchAllTweets(); 
        } catch (error) {
          console.error("Auto-login error:", error);
          localStorage.removeItem("token"); // Remove invalid token if auto-login fails
        }
      } else {
        fetchAllTweets();
      }
    };
    autoLogin();
    

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

  // PAGINATION CONTROLS
  // Move to previous page
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  // Move to next page (only if there are more tweets)
  const handleNextPage = () => {
    setCurrentPage((prev) =>
      (prev * pageSize < allTweets.length) ? prev + 1 : prev
    );
  };

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
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="w-full flex justify-between items-center py-4 px-4">
          <h1 className="font-pacifico text-4xl text-white">
            Live Social Media
          </h1>
          <div className="">
            <span className="sm:mr-3">
              Logged in as: {currentUser.username}
            </span>
            <Button
              variant="secondary"
              onClick={() => {
                setCurrentUser(null);
                setAllTweets([]);
                setTweets([]); 
                localStorage.removeItem("token"); // clearing token on logout
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

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <Button onClick={handlePrevPage} disabled={currentPage === 1}>
            Previous Page
          </Button>
          <span>
            Page {currentPage} of {Math.ceil(allTweets.length / pageSize)}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage * pageSize >= allTweets.length}
          >
            Next Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default App;
