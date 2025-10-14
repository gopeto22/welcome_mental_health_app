import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

interface UseRecorderProps {
  deviceId: string | null;
  onChunkReady: (chunk: Blob, sequenceIndex: number) => Promise<void>;
}

export const useRecorder = ({ deviceId, onChunkReady }: UseRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const sequenceIndexRef = useRef(0);

  const startRecording = useCallback(async () => {
    try {
      // Get media stream with selected device
      const constraints: MediaStreamConstraints = {
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Create MediaRecorder with webm format
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Handle data available (chunks)
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          
          // Send chunk every 2-3 seconds
          const blob = new Blob([event.data], { type: "audio/webm" });
          try {
            await onChunkReady(blob, sequenceIndexRef.current);
            sequenceIndexRef.current++;
          } catch (error) {
            console.error("Error sending chunk:", error);
            toast.error("Failed to process audio chunk");
          }
        }
      };

      // Start recording with 2.5 second chunks
      mediaRecorder.start(2500);
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to start recording. Please check microphone permissions.");
    }
  }, [deviceId, onChunkReady]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      
      // Reset sequence index for next recording
      sequenceIndexRef.current = 0;
    }
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
};
