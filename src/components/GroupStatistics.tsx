import { BarChart3 } from "lucide-react";
import { AnalysisData } from "../types";
import { InfoTooltip } from "./InfoTooltip";

interface GroupStatisticsProps {
  analysis: AnalysisData["analysis"];
}

export function GroupStatistics({ analysis }: GroupStatisticsProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-neutral-400" /> Group Statistics
        </h3>
        <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-md font-mono">{analysis.scoreType} score</span>
      </div>

      <div className="space-y-6">
        {['female', 'male'].map((group) => {
          const stats = analysis.groups[group as 'male'|'female'];
          if (!stats) return null;
          
          return (
            <div key={group} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium capitalize">{group}</span>
                <span className="text-sm text-neutral-500">n = {stats.sampleSize}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                  <span className="flex items-center text-neutral-500 mb-1">Mean <InfoTooltip content="The arithmetic average of the group's scores." /></span>
                  <span className="font-semibold text-neutral-900 text-base">{stats.mean}</span>
                </div>
                <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                  <span className="flex items-center text-neutral-500 mb-1">Std Dev <InfoTooltip content="A measure of the variation or dispersion of the scores." /></span>
                  <span className="font-semibold text-neutral-900 text-base">{stats.standardDeviation}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
