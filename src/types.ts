export type ScoreType = "average" | "math" | "reading" | "writing";

export type GroupStats = {
  sampleSize: number;
  mean: number;
  standardDeviation: number;
  minimum: number;
  maximum: number;
};

export type BoxplotStats = {
  minimum: number;
  q1: number;
  median: number;
  q3: number;
  maximum: number;
  mean: number;
  outliers: number[];
};

export type HistogramData = {
  bins: string[];
  groups: Record<string, number[]>;
};

export type BarChartData = {
  meanScores: Array<{ group: string; value: number }>;
  standardDeviation: Array<{ group: string; value: number }>;
};

export type ConfidenceIntervalPlot = {
  estimate: number;
  lower: number;
  upper: number;
  nullValue: number;
  label: string;
};

export interface AnalysisData {
  project: string;
  dataset: {
    fileName: string;
    totalRows: number;
    validRows: number;
    removedRows: number;
    columns: string[];
    numericColumns: string[];
  };
  analysis: {
    scoreType: ScoreType;
    groupVariable: string;
    groups: Record<string, GroupStats>;
    comparison: {
      meanDifference: number;
      standardError: number;
      degreesOfFreedom: number;
      confidenceLevel: number;
      confidenceInterval: { lower: number; upper: number };
      tStatistic: number;
      pValue: number;
      isSignificant: boolean;
    };
    interpretation: string;
  };
  visualization?: {
    boxplot: Record<string, BoxplotStats>;
    histogram: HistogramData;
    barChart: BarChartData;
    confidenceIntervalPlot: ConfidenceIntervalPlot;
  };
}
