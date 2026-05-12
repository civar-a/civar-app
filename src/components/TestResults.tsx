import { Calculator } from "lucide-react";
import { AnalysisData } from "../types";
import { InfoTooltip } from "./InfoTooltip";

interface TestResultsProps {
  comparison: AnalysisData["analysis"]["comparison"];
}

export function TestResults({ comparison }: TestResultsProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-6 flex flex-col">
      <h3 className="font-semibold text-lg flex items-center">
        <Calculator className="w-5 h-5 mr-2 text-neutral-400" /> Welch's t-test
      </h3>

      <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm mt-2 flex-1 content-start">
        <div className="border-b border-neutral-100 pb-3">
          <span className="flex items-center text-neutral-500 mb-1">T-Statistic <InfoTooltip content="The calculated difference represented in units of standard error." /></span>
          <span className="font-semibold font-mono text-base">{comparison.tStatistic}</span>
        </div>
        <div className="border-b border-neutral-100 pb-3">
          <span className="flex items-center text-neutral-500 mb-1">P-Value <InfoTooltip content="The probability of observing this data if there were truly no difference." /></span>
          <span className="font-semibold font-mono text-base">{comparison.pValue}</span>
        </div>
        <div className="border-b border-neutral-100 pb-3">
          <span className="flex items-center text-neutral-500 mb-1">Mean Difference <InfoTooltip content="The difference between the averages of the two groups." /></span>
          <span className="font-semibold font-mono text-base">{comparison.meanDifference}</span>
        </div>
        <div className="border-b border-neutral-100 pb-3">
          <span className="flex items-center text-neutral-500 mb-1">Degrees of Freedom <InfoTooltip content="An estimate of the independent pieces of information that went into calculating the estimate." /></span>
          <span className="font-semibold font-mono text-base">{comparison.degreesOfFreedom}</span>
        </div>
        <div className="col-span-2 pt-2">
          <div className="flex items-center mb-3">
            <span className="text-neutral-500">95% Confidence Interval</span>
            <InfoTooltip content="A range of values that we are 95% confident contains the true mean difference." />
          </div>
          <div className="flex items-center space-x-3 font-mono bg-neutral-900 text-white p-4 rounded-xl text-center shadow-inner">
            <span className="flex-1 border-r border-neutral-700">{comparison.confidenceInterval.lower}</span>
            <span className="flex-1">{comparison.confidenceInterval.upper}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
