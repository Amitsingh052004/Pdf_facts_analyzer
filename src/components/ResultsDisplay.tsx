import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, MapPin, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

interface FactResult {
  pointer: string;
  snippets: Array<{
    text: string;
    page: number;
    offset: { start: number; end: number };
  }>;
  rationale: string;
}

interface ResultsDisplayProps {
  results: FactResult[];
}

export const ResultsDisplay = ({ results }: ResultsDisplayProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold">Analysis Results</h2>
      <div className="space-y-4">
        {results.map((result, index) => (
          <Card
            key={index}
            className="overflow-hidden hover:shadow-elegant transition-shadow duration-300"
          >
            <CardHeader className="bg-gradient-subtle border-b border-border">
              <CardTitle className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-lg">
                  {index + 1}
                </span>
                <span className="flex-1">{result.pointer}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {result.snippets.map((snippet, snippetIndex) => (
                <div
                  key={snippetIndex}
                  className="border border-border rounded-lg p-4 bg-card space-y-3"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium">Page {snippet.page}</span>
                    <span className="text-xs">
                      (Offset: {snippet.offset.start} - {snippet.offset.end})
                    </span>
                  </div>
                  <blockquote className="border-l-4 border-primary pl-4 py-2 bg-primary/5 rounded-r">
                    <p className="text-sm leading-relaxed">{snippet.text}</p>
                  </blockquote>
                </div>
              ))}

              <div className="pt-2">
                <Button
                  variant="ghost"
                  onClick={() => toggleExpand(index)}
                  className="w-full justify-between hover:bg-secondary"
                >
                  <span className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Explanation
                  </span>
                  {expandedIndex === index ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                {expandedIndex === index && (
                  <div className="mt-3 p-4 bg-secondary/50 rounded-lg animate-in slide-in-from-top-2 duration-300">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {result.rationale}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
