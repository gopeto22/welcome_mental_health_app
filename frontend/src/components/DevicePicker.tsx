import { useEffect, useState } from "react";
import { Mic } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DevicePickerProps {
  selectedDeviceId: string | null;
  onDeviceChange: (deviceId: string) => void;
}

export const DevicePicker = ({ selectedDeviceId, onDeviceChange }: DevicePickerProps) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDevices = async () => {
      try {
        // Request permissions first
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Get audio input devices
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = allDevices.filter(device => device.kind === "audioinput");
        setDevices(audioInputs);
        
        // Auto-select first device if none selected
        if (!selectedDeviceId && audioInputs.length > 0) {
          onDeviceChange(audioInputs[0].deviceId);
        }
      } catch (error) {
        console.error("Error accessing microphone:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDevices();
  }, [selectedDeviceId, onDeviceChange]);

  return (
    <div className="space-y-2">
      <Label htmlFor="device-select" className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Mic className="h-4 w-4 text-calm-primary" />
        Microphone Device
      </Label>
      <Select
        value={selectedDeviceId || undefined}
        onValueChange={onDeviceChange}
        disabled={loading || devices.length === 0}
      >
        <SelectTrigger 
          id="device-select"
          className="w-full bg-card border-border hover:border-calm-primary transition-colors"
        >
          <SelectValue placeholder={loading ? "Loading devices..." : "Select microphone"} />
        </SelectTrigger>
        <SelectContent>
          {devices.map((device) => (
            <SelectItem key={device.deviceId} value={device.deviceId}>
              {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
