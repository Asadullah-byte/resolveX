// hooks/useVideoCall.js
import { useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000"); // adjust for prod

let localStream = null;
let peer = null;

export default function useVideoCall({
  roomId,
  localVideoRef,
  remoteVideoRef,
  onCallStarted,
  onCallEnded,
}) {
  const hasJoinedRoom = useRef(false);

  const setupMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStream = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error("Could not access media devices:", err);
      alert("Please allow camera/microphone access.");
      throw err;
    }
  };

  const setupPeer = () => {
    peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { roomId, candidate: event.candidate });
      }
    };

    peer.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    localStream.getTracks().forEach((track) =>
      peer.addTrack(track, localStream)
    );
  };

  const startCaller = async () => {
    await setupMedia();
    setupPeer();

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit("offer", { roomId, offer });
    onCallStarted?.();
  };

  const joinRoomOnce = () => {
    if (!hasJoinedRoom.current) {
      socket.emit("join-room", { roomId, userId: socket.id });
      hasJoinedRoom.current = true;
    }
  };

  const listenForCall = () => {
    joinRoomOnce();

    socket.on("offer", async (offer) => {
      await setupMedia();
      setupPeer();

      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("answer", { roomId, answer });
      onCallStarted?.();
    });

    socket.on("answer", async (answer) => {
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (peer) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on("end-call", () => {
      cleanup();
      onCallEnded?.();
    });
  };

  const cleanup = () => {
    if (peer) peer.close();
    if (localStream) localStream.getTracks().forEach((t) => t.stop());

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    socket.emit("end-call", { roomId });
  };

  return {
    startCaller: () => {
      joinRoomOnce();
      startCaller();
    },
    listenForCall,
    endCall: cleanup,
  };
}
