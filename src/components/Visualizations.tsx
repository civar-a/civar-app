import { BarChart3, Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { cn } from "../lib/utils";
import { AnalysisData } from "../types";
import { InfoTooltip } from "./InfoTooltip";

const BoxPlotShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  const { minimum, q1, median, q3, maximum, outliers, mean, fill, strokeColor, maxBound } = payload;
  
  if (!maxBound || height === 0) return null;
  const bottomY = y + height;
  const getY = (val: number) => bottomY - (val / maxBound) * height;

  const minY = getY(minimum);
  const q1Y = getY(q1);
  const medY = getY(median);
  const q3Y = getY(q3);
  const maxY = getY(maximum);
  const meanY = mean !== undefined ? getY(mean) : null;

  const centerX = x + width / 2;
  const boxWidth = Math.min(width * 0.6, 60);
  const boxLeft = centerX - boxWidth / 2;

  return (
    <g>
      {/* Whiskers */}
      <line x1={centerX} y1={minY} x2={centerX} y2={q1Y} stroke={strokeColor} strokeWidth={2} />
      <line x1={centerX} y1={q3Y} x2={centerX} y2={maxY} stroke={strokeColor} strokeWidth={2} />
      
      {/* Whisker caps */}
      <line x1={centerX - 8} y1={minY} x2={centerX + 8} y2={minY} stroke={strokeColor} strokeWidth={2} />
      <line x1={centerX - 8} y1={maxY} x2={centerX + 8} y2={maxY} stroke={strokeColor} strokeWidth={2} />
      
      {/* Box */}
      <rect x={boxLeft} y={q3Y} width={boxWidth} height={Math.max(0, q1Y - q3Y)} fill={fill} fillOpacity={0.9} stroke={strokeColor} strokeWidth={2} rx={2} ry={2} />
      
      {/* Median */}
      <line x1={boxLeft} y1={medY} x2={boxLeft + boxWidth} y2={medY} stroke="#fff" strokeWidth={2.5} opacity={0.9} />
      
      {/* Mean (Cross) */}
      {meanY !== null && (
         <path d={`M ${centerX - 4} ${meanY - 4} L ${centerX + 4} ${meanY + 4} M ${centerX + 4} ${meanY - 4} L ${centerX - 4} ${meanY + 4}`} stroke="#fff" strokeWidth={2} opacity={0.8} />
      )}
      
      {/* Outliers */}
      {outliers && outliers.map((outlier: number, i: number) => (
        <circle key={i} cx={centerX} cy={getY(outlier)} r={4} fill={fill} stroke="white" strokeWidth={1} />
      ))}
    </g>
  );
};

const BoxPlotTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-neutral-200 p-3 rounded-xl shadow-lg text-sm min-w-[180px]">
         <p className="font-semibold border-b pb-2 mb-2">{label}</p>
         <div className="space-y-1.5">
           <div className="flex justify-between"><span className="text-neutral-500">Maximum:</span> <span className="font-medium">{data.maximum}</span></div>
           <div className="flex justify-between"><span className="text-neutral-500">Q3 (75th):</span> <span className="font-medium">{data.q3}</span></div>
           <div className="flex justify-between"><span className="text-neutral-800 font-medium">Median:</span> <span className="font-bold">{data.median}</span></div>
           <div className="flex justify-between"><span className="text-neutral-500">Mean:</span> <span className="font-medium">{data.mean}</span></div>
           <div className="flex justify-between"><span className="text-neutral-500">Q1 (25th):</span> <span className="font-medium">{data.q1}</span></div>
           <div className="flex justify-between"><span className="text-neutral-500">Minimum:</span> <span className="font-medium">{data.minimum}</span></div>
           {data.outliers && data.outliers.length > 0 && (
             <div className="flex justify-between text-xs mt-2 pt-2 border-t text-neutral-400">
                <span>Outliers:</span> <span>{data.outliers.length}</span>
             </div>
           )}
         </div>
      </div>
    );
  }
  return null;
};

interface VisualizationsProps {
  result: AnalysisData;
}

export function Visualizations({ result }: VisualizationsProps) {
  if (!result.visualization) return null;

  const boxPlotData = [];
  if (result.visualization?.boxplot?.male) {
    const maleBp = result.visualization.boxplot.male;
    boxPlotData.push({
      name: "Male",
      ...maleBp,
      maxBound: Math.max(maleBp.maximum, ...(maleBp.outliers || [])),
      fill: '#3b82f6',
      strokeColor: '#1d4ed8'
    });
  }
  if (result.visualization?.boxplot?.female) {
    const femaleBp = result.visualization.boxplot.female;
    boxPlotData.push({
      name: "Female",
      ...femaleBp,
      maxBound: Math.max(femaleBp.maximum, ...(femaleBp.outliers || [])),
      fill: '#ec4899',
      strokeColor: '#be185d'
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Mean & Std Dev Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <h3 className="font-semibold text-lg flex items-center mb-6">
            <BarChart3 className="w-5 h-5 mr-2 text-neutral-400" /> Means Comparison
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: "Mean Score",
                    Male: result.visualization.barChart.meanScores.find(m => m.group === 'male')?.value,
                    Female: result.visualization.barChart.meanScores.find(m => m.group === 'female')?.value,
                  }
                ]}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#888' }} />
                <YAxis tick={{ fontSize: 12, fill: '#888' }} domain={[0, 'auto']} />
                <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="Male" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                <Bar dataKey="Female" fill="#ec4899" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confidence Interval Visualization */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col">
          <h3 className="font-semibold text-lg flex items-center mb-6">
            <Activity className="w-5 h-5 mr-2 text-neutral-400" /> Confidence Interval
          </h3>
          <div className="flex-1 flex flex-col justify-center px-4">
            <p className="text-sm border flex items-center justify-center p-3 rounded-xl mb-8 bg-neutral-50 shadow-inner">
              <strong>{result.visualization.confidenceIntervalPlot.label}</strong>&nbsp; CI at 95%
            </p>
            <div className="relative w-full h-24 mb-4">
              {/* Base line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-neutral-200 -translate-y-1/2"></div>
              
              {/* CI Range */}
              {(() => {
                const lower = result.visualization.confidenceIntervalPlot.lower;
                const upper = result.visualization.confidenceIntervalPlot.upper;
                const estimate = result.visualization.confidenceIntervalPlot.estimate;
                
                // Calculate padding based on CI width
                const ciWidth = upper - lower;
                // Fallback to a minimum width if upper and lower are identical
                const padding = ciWidth > 0 ? ciWidth * 0.3 : Math.abs(estimate) * 0.3 || 1;
                
                // Ensure 0 (the null hypothesis) in view
                let minVal = Math.min(0, lower - padding);
                let maxVal = Math.max(0, upper + padding);
                
                // If 0 is at the very edge, give it some breathing room
                if (minVal === 0) minVal -= padding;
                if (maxVal === 0) maxVal += padding;
                
                const range = maxVal - minVal;
                
                const qLeft = ((lower - minVal) / range) * 100;
                const qRight = ((upper - minVal) / range) * 100;
                const qMid = ((estimate - minVal) / range) * 100;
                const zeroPos = ((0 - minVal) / range) * 100;

                return (
                  <>
                    <div 
                      className="absolute top-0 bottom-0 w-[1px] bg-red-400 border-l border-dashed z-0"
                      style={{ left: `${zeroPos}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-red-500 bg-white border border-red-200 px-2 py-0.5 rounded shadow-sm">0 (Null)</div>
                    </div>
                    <div 
                      className={cn("absolute top-1/2 h-2 -translate-y-1/2 rounded-full z-10", result.analysis.comparison.isSignificant ? "bg-green-500": "bg-neutral-500")}
                      style={{ left: `${qLeft}%`, right: `${100 - qRight}%` }}
                    ></div>
                    <div 
                      className="absolute top-1/2 w-4 h-4 rounded-full border-2 border-white bg-blue-600 -translate-y-1/2 -translate-x-1/2 z-20 shadow text-xs flex justify-center hover:scale-125 transition-transform"
                      style={{ left: `${qMid}%` }}
                      title={`Estimate: ${estimate}`}
                    >
                    </div>
                    
                    <div className="absolute top-[65%] text-xs font-mono text-neutral-500 -translate-x-1/2" style={{ left: `${qLeft}%` }}>
                      {lower}
                    </div>
                    <div className="absolute top-[65%] text-xs font-mono text-neutral-500 -translate-x-1/2" style={{ left: `${qRight}%` }}>
                      {upper}
                    </div>
                    <div className="absolute top-[-25%] text-xs font-bold text-blue-700 -translate-x-1/2" style={{ left: `${qMid}%` }}>
                      Mean Diff: {estimate}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Distribution Histograms */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
        <h3 className="font-semibold text-lg flex items-center mb-6">
          <BarChart3 className="w-5 h-5 mr-2 text-neutral-400" /> Score Distributions (Histogram)
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={result.visualization.histogram.bins.map((bin, i) => ({
                bin,
                Male: result.visualization.histogram.groups.male[i],
                Female: result.visualization.histogram.groups.female[i],
              }))}
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.4} />
              <XAxis dataKey="bin" tick={{ fontSize: 12, fill: '#666' }} axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis tick={{ fontSize: 12, fill: '#666' }} axisLine={false} tickLine={false} />
              <RechartsTooltip cursor={{ fill: '#f5f5f5' }} contentStyle={{ borderRadius: '8px', border: '1px solid #eaeaea', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
              <Bar dataKey="Male" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Female" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Boxplot Visualization */}
      {boxPlotData.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <h3 className="font-semibold text-lg flex items-center mb-6">
            <Activity className="w-5 h-5 mr-2 text-neutral-400" /> Score Distribution by Gender
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={boxPlotData}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.4} />
                <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#666', fontWeight: 500 }} axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis tick={{ fontSize: 12, fill: '#666' }} domain={[0, 'auto']} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{ fill: '#f9fafb' }} content={<BoxPlotTooltip />} />
                <Bar dataKey="maxBound" shape={<BoxPlotShape />} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
