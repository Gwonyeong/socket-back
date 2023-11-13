import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";

const url = "http://localhost:8000/chat";
let socket = io(url);

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [isLogin, setIsLogin] = useState(false);

  const [roomNum, setRoomNum] = useState<number | undefined>(undefined);
  const [message, setMessage] = useState("");

  const [messageLog, setMessageLog] = useState<string[]>([""]);

  const login = useCallback(() => {
    console.log(userId, username);
    if (!userId || !username) {
      return;
    }
    setIsLogin(true);
    setIsConnected(true);
  }, [userId, username]);

  const joinRoom = useCallback(
    (roomId: number) => {
      socket.emit("join", {
        userId,
        username,
        roomId,
      });
      setRoomNum(roomId);
    },
    [userId, username]
  );

  const sendMessage = useCallback(
    (message: string) => {
      console.log(message);
      socket.emit("send-message", {
        userId,
        username,
        roomId: roomNum,
        message,
      });
    },
    [message]
  );

  useEffect(() => {
    socket.on("joined", (data) => {
      console.log(data);
    });

    socket.on("send-message", (data) => {
      console.log(data);
      console.log(messageLog);
      setMessageLog((prev) => [...prev, data.message]);
    });

    return () => {
      socket.off("joined");
      socket.off("send-message");
    };
  }, []);

  if (!isLogin) {
    return (
      <div
        className="App"
        style={{
          display: "flex",
          flexDirection: "column",
          width: "300px",
          alignItems: "center",
        }}
      >
        <h1>Socket.io</h1>
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="userId"
          placeholder="id"
          value={userId}
          onChange={(e) => setUserId(Number(e.target.value))}
        />
        <button onClick={() => login()}>Login</button>
      </div>
    );
  }

  if (roomNum) {
    return (
      <div className="App">
        <h1>Socket.io</h1>
        <h2>Connected: {isConnected.toString()}</h2>
        <h2>Room: {roomNum}</h2>
        <div>
          메세지
          <input
            type="text"
            placeholder="message"
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={() => sendMessage(message)}>Send</button>
        </div>
        {messageLog.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Socket.io</h1>
      <h2>Connected: {isConnected.toString()}</h2>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <div>
          <button onClick={() => joinRoom(1)}>room1</button>
        </div>
        <div>
          <button onClick={() => joinRoom(2)}>room2</button>
        </div>
        <div>
          <button onClick={() => joinRoom(3)}>room3</button>
        </div>
      </div>
    </div>
  );
}

export default App;
