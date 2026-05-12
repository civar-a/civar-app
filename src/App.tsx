import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { BarChart3 } from "lucide-react";
import { ScoreType, AnalysisData } from "./types";
import { Header } from "./components/Header";
import { DataInputPanel } from "./components/DataInputPanel";
import { Conclusion } from "./components/Conclusion";
import { DatasetOverview } from "./components/DatasetOverview";
import { GroupStatistics } from "./components/GroupStatistics";
import { TestResults } from "./components/TestResults";
import { Visualizations } from "./components/Visualizations";
import { Footer } from "./components/Footer";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [scoreType, setScoreType] = useState<ScoreType>("average");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisData | null>(() => {
    try {
      const cached = localStorage.getItem("civara:last-analysis");
      if (cached) {
        return JSON.parse(cached).analysis;
      }
    } catch {
      // Ignore
    }
    return null;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith(".csv") || droppedFile.type === "text/csv") {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Please upload a valid CSV file.");
      }
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const submitForm = async () => {
    if (!file) {
      setError("No file selected.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("scoreType", scoreType);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://api-civara.mahros.dev/api/v1";
      const response = await fetch(`${apiUrl}/analyze`, {
        method: "POST",
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error?.message || json.message || "An error occurred.");
      }

      setResult(json.data);
      try {
        localStorage.setItem("civara:last-analysis", JSON.stringify({
          uploadedAt: new Date().toISOString(),
          fileName: file.name,
          analysis: json.data
        }));
      } catch {
        // Ignore
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          <div className="xl:col-span-4 space-y-6">
            <DataInputPanel
              file={file}
              scoreType={scoreType}
              loading={loading}
              error={error}
              fileInputRef={fileInputRef}
              onFileDrop={handleFileDrop}
              onFileSelect={handleFileSelect}
              onScoreTypeChange={setScoreType}
              onSubmit={submitForm}
            />
          </div>

          <div className="xl:col-span-8 flex flex-col space-y-6">
            {!result && !loading && (
              <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center text-center text-neutral-400 bg-white border border-neutral-200 border-dashed rounded-2xl p-8">
                <BarChart3 className="w-12 h-12 mb-4 text-neutral-300" />
                <h3 className="text-lg font-medium text-neutral-900 mb-1">Awaiting Data</h3>
                <p className="text-sm max-w-sm">Upload a student performance dataset and run an analysis to view confidence intervals and hypothesis testing results.</p>
              </div>
            )}
            
            {loading && (
              <div className="flex-1 min-h-[400px] flex items-center justify-center bg-white border border-neutral-200 rounded-2xl p-8">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            )}

            {result && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                <Conclusion analysis={result.analysis} />
                <DatasetOverview dataset={result.dataset} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GroupStatistics analysis={result.analysis} />
                  <TestResults comparison={result.analysis.comparison} />
                </div>

                <Visualizations result={result} />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

