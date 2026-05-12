import { ChangeEvent, DragEvent, RefObject } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";
import { ScoreType } from "../types";

interface DataInputPanelProps {
  file: File | null;
  scoreType: ScoreType;
  loading: boolean;
  error: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileDrop: (e: DragEvent<HTMLDivElement>) => void;
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  onScoreTypeChange: (type: ScoreType) => void;
  onSubmit: () => void;
}

export function DataInputPanel({
  file,
  scoreType,
  loading,
  error,
  fileInputRef,
  onFileDrop,
  onFileSelect,
  onScoreTypeChange,
  onSubmit,
}: DataInputPanelProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
      <h2 className="text-lg font-semibold mb-4">Data Input</h2>
      
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-colors hover:bg-neutral-50 cursor-pointer",
          file ? "border-blue-500 bg-blue-50/50" : "border-neutral-300"
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onFileDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          accept=".csv"
          className="hidden"
          onChange={onFileSelect}
          ref={fileInputRef}
        />
        
        {file ? (
          <div className="flex flex-col items-center text-blue-600">
            <CheckCircle2 className="w-8 h-8 mb-3" />
            <span className="font-medium text-sm truncate w-full max-w-[200px]">{file.name}</span>
            <span className="text-xs text-blue-400 mt-1">{(file.size / 1024).toFixed(1)} KB</span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-neutral-500">
            <UploadCloud className="w-8 h-8 mb-3 text-neutral-400" />
            <span className="font-medium text-sm">Drop CSV here or click to browse</span>
          </div>
        )}
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-neutral-700 mb-2">Score Type</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "average", label: "Average" },
            { value: "math", label: "Math" },
            { value: "reading", label: "Reading" },
            { value: "writing", label: "Writing" },
          ].map((opt) => (
            <label
              key={opt.value}
              className={cn(
                "flex items-center justify-center py-2 px-3 border rounded-lg cursor-pointer transition-colors text-sm font-medium",
                scoreType === opt.value
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
              )}
            >
              <input
                type="radio"
                name="scoreType"
                value={opt.value}
                checked={scoreType === opt.value}
                onChange={(e) => onScoreTypeChange(e.target.value as ScoreType)}
                className="hidden"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mr-3" />
          <p className="leading-tight">{error}</p>
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={loading || !file}
        className="w-full mt-6 flex items-center justify-center px-4 py-3 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 transition-colors"
      >
        {loading ? "Analyzing..." : "Run Analysis"}
        {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
      </button>
    </div>
  );
}
