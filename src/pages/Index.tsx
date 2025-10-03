import { useState } from "react";
import { FileSearch, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFUpload } from "@/components/PDFUpload";
import { PointerInput } from "@/components/PointerInput";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { useToast } from "@/hooks/use-toast";

interface FactResult {
  pointer: string;
  snippets: Array<{
    text: string;
    page: number;
    offset: { start: number; end: number };
  }>;
  rationale: string;
}

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pointers, setPointers] = useState<string[]>([]);
  const [results, setResults] = useState<FactResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please upload a PDF document first",
        variant: "destructive",
      });
      return;
    }

    if (pointers.length === 0) {
      toast({
        title: "No queries added",
        description: "Please add at least one query to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Prepare FormData for the API call
    const formData = new FormData();
    formData.append("pdf", selectedFile); // matches backend parameter
    formData.append("pointers", JSON.stringify(pointers));

    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setResults(data.results);

      toast({
        title: "Analysis complete",
        description: `Found information for ${data.results.length} queries`,
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Please check your backend connection and try again",
        variant: "destructive",
      });
      
      // Demo fallback data for testing UI
      setResults([
        {
          pointer: pointers[0],
          snippets: [
            {
              text: "This is a sample extracted text from the PDF document. Replace this with actual backend data.",
              page: 1,
              offset: { start: 120, end: 245 },
            },
          ],
          rationale: "This snippet was identified based on keyword matching and context analysis.",
        },
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPointers([]);
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-primary p-2 shadow-elegant">
              <FileSearch className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">PDF Facts Analyzer</h1>
              <p className="text-sm text-muted-foreground">
                Extract specific information from your documents
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-8">
          {/* Upload Section */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Step 1: Upload Document</h2>
              <p className="text-muted-foreground">
                Select a PDF file to analyze
              </p>
            </div>
            <PDFUpload
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
            />
          </section>

          {/* Pointers Section */}
          {selectedFile && (
            <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Step 2: Add Your Queries
                </h2>
                <p className="text-muted-foreground">
                  What information do you want to extract from the document?
                </p>
              </div>
              <PointerInput pointers={pointers} onPointersChange={setPointers} />
            </section>
          )}

          {/* Analyze Button */}
          {selectedFile && pointers.length > 0 && (
            <div className="flex gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                size="lg"
                className="bg-gradient-primary shadow-elegant hover:opacity-90 transition-opacity min-w-40"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileSearch className="h-5 w-5 mr-2" />
                    Analyze Document
                  </>
                )}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                disabled={isAnalyzing}
              >
                Reset
              </Button>
            </div>
          )}

          {/* Results Section */}
          {results.length > 0 && <ResultsDisplay results={results} />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8 bg-card/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Connect this frontend to your Python backend API to enable analysis</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
