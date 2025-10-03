import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface PointerInputProps {
  pointers: string[];
  onPointersChange: (pointers: string[]) => void;
}

export const PointerInput = ({ pointers, onPointersChange }: PointerInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      onPointersChange([...pointers, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleRemove = (index: number) => {
    onPointersChange(pointers.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="e.g., List all dates, Who signed?, Total contract value?"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="bg-gradient-primary shadow-elegant hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {pointers.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Your Queries ({pointers.length})
          </h4>
          <div className="space-y-2">
            {pointers.map((pointer, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-secondary/50 border border-border rounded-lg p-3 group hover:border-primary/50 transition-colors"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                  {index + 1}
                </span>
                <p className="flex-1 text-sm">{pointer}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(index)}
                  className="opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
