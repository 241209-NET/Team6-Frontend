// signalRConnection.ts
import { Tweet } from "@/vite-env";
import { HubConnectionBuilder, HubConnection } from "@microsoft/signalr";

let connection: HubConnection | null = null;

type Handlers = {
  onReceiveTweet: (tweet: Tweet) => void;
  onUpdateTweet: (tweet: Tweet) => void;
  onLikeTweet: (tweetId: number) => void;
  onUnlikeTweet: (tweetId: number) => void;
  onDeleteTweet: (tweetId: number) => void;
};

export async function initializeSignalRConnection(handlers: Handlers) {
  connection = new HubConnectionBuilder()
    .withUrl("http://localhost:5108/socialMediaHub")
    .withAutomaticReconnect()
    .build();

  try {
    await connection.start();
    console.log("Connected to SignalR hub");

    // attaching the handlers here
    connection.on("ReceiveTweet", handlers.onReceiveTweet);
    connection.on("UpdateTweet", handlers.onUpdateTweet);
    connection.on("LikeTweet", handlers.onLikeTweet);
    connection.on("UnlikeTweet", handlers.onUnlikeTweet);
    connection.on("DeleteTweet", handlers.onDeleteTweet);
  } catch (err) {
    console.error("Error connecting to SignalR hub:", err);
  }
}

export function getSignalRConnection() {
  return connection;
}
