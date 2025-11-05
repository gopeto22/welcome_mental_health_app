import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface SudsSliderProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  disabled?: boolean;
  locale?: "en-US" | "ta-IN";
}

export const SudsSlider = ({ value, onChange, label, disabled = false, locale = "en-US" }: SudsSliderProps) => {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (values: number[]) => {
    const newValue = values[0];
    setLocalValue(newValue);
    onChange(newValue);
  };

  const getSudsColor = (level: number): string => {
    if (level <= 2) return "text-green-600";
    if (level <= 4) return "text-blue-600";
    if (level <= 6) return "text-yellow-600";
    if (level <= 8) return "text-orange-600";
    return "text-red-600";
  };

  const getSudsLabel = (level: number): string => {
    if (locale === "ta-IN") {
      if (level === 0) return "முற்றிலும் அமைதி";
      if (level <= 2) return "மிகக் குறைந்த";
      if (level <= 4) return "குறைந்த";
      if (level <= 6) return "நடுத்தர";
      if (level <= 8) return "அதிக";
      return "மிக அதிக";
    } else {
      if (level === 0) return "Completely Calm";
      if (level <= 2) return "Very Low";
      if (level <= 4) return "Low";
      if (level <= 6) return "Moderate";
      if (level <= 8) return "High";
      return "Extreme";
    }
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="suds-slider" className="text-sm font-medium">
        {label}
      </Label>
      
      <div className="space-y-2">
        <Slider
          id="suds-slider"
          min={0}
          max={10}
          step={1}
          value={[localValue]}
          onValueChange={handleChange}
          disabled={disabled}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{locale === "en-US" ? "0 - Calm" : "0 - அமைதி"}</span>
          <span className={`font-bold text-lg ${getSudsColor(localValue)}`}>
            {localValue}
          </span>
          <span>{locale === "en-US" ? "10 - Extreme" : "10 - மிக அதிகம்"}</span>
        </div>
        
        <p className={`text-sm text-center font-medium ${getSudsColor(localValue)}`}>
          {getSudsLabel(localValue)}
        </p>
      </div>
    </div>
  );
};
