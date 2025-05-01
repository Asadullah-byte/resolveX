import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Stack,
  Paper,
  Divider,
  Modal,
  IconButton,
  Tooltip
} from "@mui/material";
import { Send, VideoCall } from "@mui/icons-material";
import useChatSocket from "../hooks/useChatSocket";
import useClientStore from "../store/clientStore";
import { useAuthStore } from "../store/authStore";
import { formatDistanceToNow } from "date-fns";
import useVideoCall from "../hooks/useVideoCall";
import { motion } from "framer-motion";

const modalStyles = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
  p: 3,
  width: 700,
};

const AssignmentChat = ({ assignmentId }) => {
  const { fetchChatMessages, sendChatMessage } = useClientStore();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(null);
  const messagesEndRef = useRef();

  const [callActive, setCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [showCallButton, setShowCallButton] = useState(true);
  const localRef = useRef();
  const remoteRef = useRef();
  const ringtoneRef = useRef(null);
  const callingSoundRef = useRef(null);
  const endSoundRef = useRef(null);

  const systemMessageSent = useRef({ start: false, end: false });
  const callEndedOnce = useRef(false);

  // Real-time chat socket: update messages on new message
  useChatSocket(assignmentId, (msg) => {
    setMessages((prev) => [...prev, msg]);
  });

  const addSystemMessage = async (msg, type) => {
    if (systemMessageSent.current[type]) return;
    systemMessageSent.current[type] = true;
    const newMsg = {
      message: msg,
      senderId: "system",
      sentAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    await sendChatMessage(assignmentId, newMsg);
  };

  const {
    startCaller,
    listenForCall,
    endCall,
    acceptCaller,
  } = useVideoCall({
    roomId: assignmentId,
    localVideoRef: localRef,
    remoteVideoRef: remoteRef,
    onCallStarted: () => {
      setCallActive(true);
      callingSoundRef.current?.pause();
      callEndedOnce.current = false;
      addSystemMessage("📞 Call started", "start");
    },
    onCallEnded: () => {
      if (callEndedOnce.current) return;
      callEndedOnce.current = true;
      setCallActive(false);
      setShowCallButton(true);
      setIncomingCall(false);
      if (endSoundRef.current) {
        endSoundRef.current.currentTime = 0;
        endSoundRef.current.play();
        endSoundRef.current.onended = () => {
          endSoundRef.current.currentTime = 0;
        };
      }
      addSystemMessage("📴 Call ended", "end");
    },
    onIncomingCall: () => {
      setIncomingCall(true);
      ringtoneRef.current?.play().catch(err => console.warn("Ringtone autoplay blocked", err));
    },
  });

  useEffect(() => {
    const load = async () => {
      const res = await fetchChatMessages(assignmentId);
      if (res?.messages) setMessages(res.messages);
    };
    load();
    listenForCall();
    // Reset system message flags and call end guard on assignment change
    systemMessageSent.current = { start: false, end: false };
    callEndedOnce.current = false;
  }, [assignmentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const newMsg = {
      message: text,
      senderId: user.id,
      sentAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]); // Optimistically update UI
    await sendChatMessage(assignmentId, newMsg);
    setText("");
  };

  const handleTyping = () => {
    if (window.socket) {
      window.socket.emit("chat:typing", {
        room: assignmentId,
        name: `${user.fname} ${user.lname}`,
      });
    }
  };

  return (
    <Box>
      <audio ref={ringtoneRef} src="/sounds/ringtone.mp3" loop preload="auto" />
      <audio ref={callingSoundRef} src="/sounds/calling.mp3" loop preload="auto" />
      <audio ref={endSoundRef} src="/sounds/call-end.mp3" preload="auto" />

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h6">Conversation</Typography>
        {showCallButton && (
          <Tooltip title="Start video call">
            <IconButton
              color="secondary"
              onClick={async () => {
                setCallActive(true);
                setShowCallButton(false);
                systemMessageSent.current = { start: false, end: false };
                callEndedOnce.current = false;
                callingSoundRef.current?.play().catch(err => console.warn("Calling sound autoplay blocked", err));
                setTimeout(() => {
                  startCaller();
                }, 300);
              }}
            >
              <VideoCall />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <Modal open={incomingCall}>
        <Box sx={{ ...modalStyles, textAlign: 'center' }}>
          <Typography variant="h6" mb={2}>Incoming Call</Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              onClick={() => {
                ringtoneRef.current?.pause();
                acceptCaller();
                setIncomingCall(false);
                setCallActive(true);
                systemMessageSent.current = { start: false, end: false };
                callEndedOnce.current = false;
              }}
              variant="contained"
              color="success"
            >
              Accept
            </Button>
            <Button
              onClick={() => {
                ringtoneRef.current?.pause();
                setIncomingCall(false);
              }}
              variant="outlined"
              color="error"
            >
              Decline
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal open={callActive} onClose={() => {
        endCall();
        setCallActive(false);
        setShowCallButton(true);
      }}>
        <Box sx={modalStyles}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Video Call</Typography>
            <Button onClick={() => {
              endCall();
              setCallActive(false);
              setShowCallButton(true);
            }}>
              End
            </Button>
          </Stack>
          <Stack direction="row" spacing={2} mt={2}>
            <video ref={localRef} autoPlay muted style={{ width: 300, borderRadius: 8, background: '#000' }} />
            <video ref={remoteRef} autoPlay style={{ width: 300, borderRadius: 8, background: '#000' }} />
          </Stack>
        </Box>
      </Modal>

      <Paper
        variant="outlined"
        sx={{
          maxHeight: "350px",
          overflowY: "auto",
          p: 2,
          mb: 2,
          background: "#f9fafb",
          borderRadius: 2,
        }}
      >
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Stack
              direction="row"
              spacing={2}
              sx={{
                mb: 2,
                alignItems: "flex-start",
                flexDirection: msg.senderId === user.id ? "row-reverse" : "row",
              }}
            >
              <Avatar>
                {msg.senderId === user.id ? (user.fname?.[0] || "U") : msg.senderId[0]}
              </Avatar>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: msg.senderId === user.id ? "#4f46e5" : "inherit",
                  }}
                >
                  {msg.senderId === user.id ? "You" : msg.senderId}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    background: "#fff",
                    p: 1.2,
                    borderRadius: 2,
                    maxWidth: "400px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  {msg.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(msg.sentAt || Date.now()), {
                    addSuffix: true,
                  })}
                </Typography>
              </Box>
            </Stack>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </Paper>

      {typing && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1, fontStyle: "italic" }}
        >
          {typing} is typing...
        </Typography>
      )}

      <Divider sx={{ mb: 2 }} />

      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          fullWidth
          size="small"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          placeholder="Write a message..."
          inputProps={{ maxLength: 300 }}
        />
        <Tooltip title="Send">
          <span>
            <IconButton
              onClick={handleSend}
              color="primary"
              disabled={!text.trim()}
              sx={{ backgroundColor: text.trim() ? "#e0e7ff" : "transparent" }}
            >
              <Send />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Box>
  );
};

export default AssignmentChat;