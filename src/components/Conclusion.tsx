import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { AnalysisData } from "../types";

interface ConclusionProps {
  analysis: AnalysisData["analysis"];
}

export function Conclusion({ analysis }: ConclusionProps) {
  const isSignificant = analysis.comparison.isSignificant;
  return (
    <div className={cn(
      "p-6 rounded-2xl border",
      isSignificant 
        ? "bg-green-50 border-green-200 text-green-900" 
        : "bg-amber-50 border-amber-200 text-amber-900"
    )}>
      <div className="flex items-center space-x-3 mb-2">
        <div className={cn(
          "p-1.5 rounded-full text-white",
          isSignificant ? "bg-green-600" : "bg-amber-600"
        )}>
          {isSignificant ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        </div>
        <span className="font-semibold text-sm uppercase tracking-wide">Conclusion</span>
      </div>
      <p className="text-lg leading-relaxed font-medium ml-9">
        {analysis.interpretation}
      </p>
    </div>
  );
}
