import { BarChart3 } from "lucide-react";
import { AnalysisData } from "../types";
import { InfoTooltip } from "./InfoTooltip";

interface DatasetOverviewProps {
  dataset: AnalysisData["dataset"];
}

export function DatasetOverview({ dataset }: DatasetOverviewProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-neutral-400" /> Dataset Overview
        </h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
          <span className="flex items-center text-neutral-500 mb-1">File Name <InfoTooltip content="The name of the uploaded dataset file." /></span>
          <span className="font-medium text-neutral-900 truncate block" title={dataset.fileName}>{dataset.fileName}</span>
        </div>
        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
          <span className="flex items-center text-neutral-500 mb-1">Total Rows <InfoTooltip content="Total number of data points in the file." /></span>
          <span className="font-medium text-neutral-900">{dataset.totalRows}</span>
        </div>
        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
          <span className="flex items-center text-neutral-500 mb-1">Valid Rows <InfoTooltip content="Number of rows with valid, numeric scores." /></span>
          <span className="font-medium text-green-600">{dataset.validRows}</span>
        </div>
        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
          <span className="flex items-center text-neutral-500 mb-1">Removed Rows <InfoTooltip content="Number of rows ignored due to missing or invalid data." /></span>
          <span className="font-medium text-red-600">{dataset.removedRows}</span>
        </div>
      </div>
    </div>
  );
}
