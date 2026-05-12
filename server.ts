import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import Papa from "papaparse";
import jstat from "jstat";
import path from "path";

const app = express();
const PORT = 3000;

const upload = multer({ storage: multer.memoryStorage() });

// --- API Implementation ---

const apiRouter = express.Router();
apiRouter.use(express.json());

apiRouter.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Request completed successfully",
    data: {
      status: "ok",
      service: "Civara API",
    },
    meta: null,
  });
});

apiRouter.post("/analyze", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        data: null,
        meta: null,
        error: {
          code: "NO_FILE",
          message: "No file was uploaded.",
        },
      });
    }

    if (
      req.file.mimetype !== "text/csv" &&
      !req.file.originalname.toLowerCase().endsWith(".csv")
    ) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        data: null,
        meta: null,
        error: {
          code: "INVALID_FILE_TYPE",
          message: "The uploaded file is not a CSV file.",
        },
      });
    }

    const { scoreType = "average" } = req.body;
    const validScoreTypes = ["average", "math", "reading", "writing"];
    if (!validScoreTypes.includes(scoreType)) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        data: null,
        meta: null,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid scoreType.",
        },
      });
    }

    const csvData = req.file.buffer.toString("utf8");
    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0 && parsed.data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        data: null,
        meta: null,
        error: {
          code: "INVALID_DATA",
          message: "The dataset contains invalid or non-numeric values.",
        },
      });
    }

    if (parsed.data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        data: null,
        meta: null,
        error: {
          code: "INVALID_DATA",
          message: "The dataset is empty.",
        },
      });
    }

    const headers = parsed.meta.fields || [];
    const requiredColumns = [
      "gender",
      "math score",
      "reading score",
      "writing score",
    ];
    
    // Check missing columns (case insensitive, trimmed)
    const normalizedHeaders = headers.map((h) => h.toLowerCase().trim());
    const hasAllColumns = requiredColumns.every((col) =>
      normalizedHeaders.includes(col)
    );

    if (!hasAllColumns) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        data: null,
        meta: null,
        error: {
          code: "MISSING_COLUMNS",
          message: "One or more required columns are missing.",
        },
      });
    }

    // Function to get correctly cased column name
    const getCol = (colName: string) => {
      const idx = normalizedHeaders.indexOf(colName);
      return headers[idx];
    };

    const gCol = getCol("gender");
    const mCol = getCol("math score");
    const rCol = getCol("reading score");
    const wCol = getCol("writing score");

    const groupsData: Record<string, number[]> = {};

    for (const row of parsed.data as any[]) {
      const gender = row[gCol]?.toLowerCase().trim();
      const math = parseFloat(row[mCol]);
      const reading = parseFloat(row[rCol]);
      const writing = parseFloat(row[wCol]);

      if (!gender || isNaN(math) || isNaN(reading) || isNaN(writing)) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          data: null,
          meta: null,
          error: {
            code: "INVALID_DATA",
            message: "The dataset contains invalid or non-numeric values.",
          },
        });
      }

      let score = 0;
      if (scoreType === "average") {
        score = (math + reading + writing) / 3;
      } else if (scoreType === "math") {
        score = math;
      } else if (scoreType === "reading") {
        score = reading;
      } else if (scoreType === "writing") {
        score = writing;
      }

      if (!groupsData[gender]) {
        groupsData[gender] = [];
      }
      groupsData[gender].push(score);
    }

    const groups = Object.keys(groupsData);
    if (groups.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        data: null,
        meta: null,
        error: {
          code: "INSUFFICIENT_GROUPS",
          message: "The dataset does not contain two valid groups.",
        },
      });
    }

    // Identify male and female groups based on typical Kaggle dataset structure.
    // Ensure we specifically look for 'male' and 'female' if they exist, or just take the first two.
    let maleGrp = groups.find((g) => g === "male") || groups[0];
    let femaleGrp = groups.find((g) => g === "female") || groups[1];
    
    if (maleGrp === femaleGrp && groups.length >= 2) {
      femaleGrp = groups[groups.indexOf(maleGrp) === 0 ? 1 : 0];
    }

    const maleScores = groupsData[maleGrp];
    const femaleScores = groupsData[femaleGrp];

    const getStats = (arr: number[]) => {
      const n = arr.length;
      const sum = arr.reduce((a, b) => a + b, 0);
      const mean = sum / n;
      const variance =
        arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
      const stdDev = Math.sqrt(variance);
      const min = Math.min(...arr);
      const max = Math.max(...arr);
      return { n, mean, variance, stdDev, min, max };
    };

    const getBoxplotStats = (arr: number[]) => {
      const sorted = [...arr].sort((a, b) => a - b);
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      
      const q1 = jstat.percentile(sorted, 0.25);
      const median = jstat.percentile(sorted, 0.50);
      const q3 = jstat.percentile(sorted, 0.75);
      
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      
      const outliers = sorted.filter(v => v < lowerBound || v > upperBound);
      const adjustedMin = sorted.find(v => v >= lowerBound) ?? min;
      const adjustedMax = [...sorted].reverse().find(v => v <= upperBound) ?? max;
      
      const sum = arr.reduce((a, b) => a + b, 0);
      const mean = sum / arr.length;
      
      const format = (n: number) => Number(n.toFixed(2));
      return {
        minimum: format(adjustedMin),
        q1: format(q1),
        median: format(median),
        q3: format(q3),
        maximum: format(adjustedMax),
        mean: format(mean),
        outliers: outliers.map(format)
      };
    };

    const getHistogramStats = (arrM: number[], arrF: number[]) => {
      const bins = ["0-10", "10-20", "20-30", "30-40", "40-50", "50-60", "60-70", "70-80", "80-90", "90-100"];
      const mCounts = new Array(10).fill(0);
      const fCounts = new Array(10).fill(0);
      
      const assignToBin = (val: number, counts: number[]) => {
        let idx = Math.floor(val / 10);
        if (idx >= 10) idx = 9;
        if (idx < 0) idx = 0;
        counts[idx]++;
      };
      
      arrM.forEach(v => assignToBin(v, mCounts));
      arrF.forEach(v => assignToBin(v, fCounts));
      
      return { bins, groups: { male: mCounts, female: fCounts } };
    };

    const statsM = getStats(maleScores);
    const statsF = getStats(femaleScores);

    // Welch's t-test
    const meanDiff = statsM.mean - statsF.mean;
    const seM = statsM.variance / statsM.n;
    const seF = statsF.variance / statsF.n;
    const se = Math.sqrt(seM + seF);

    const dfNumerator = Math.pow(seM + seF, 2);
    const dfDenominator =
      Math.pow(seM, 2) / (statsM.n - 1) + Math.pow(seF, 2) / (statsF.n - 1);
    const df = dfNumerator / dfDenominator;

    const tStat = meanDiff / se;
    const pValue = 2 * (1 - jstat.studentt.cdf(Math.abs(tStat), df));
    const tCrit = jstat.studentt.inv(0.975, df);

    const marginOfError = tCrit * se;
    const ciLower = meanDiff - marginOfError;
    const ciUpper = meanDiff + marginOfError;
    const isSignificant = pValue < 0.05;

    const formatNum = (num: number) => Number(num.toFixed(2));
    const formatPValue = (num: number) => {
        const str = num.toFixed(5);
        return parseFloat(str) === 0 ? 0.00001 : parseFloat(str); // Prevent pure 0 if needed or maybe let format as is based on sample output
    };

    const interpretation = isSignificant
      ? `The 95% confidence interval does not contain zero. Therefore, there is a statistically significant difference between the mean scores of male and female students at the 5% significance level.`
      : `The 95% confidence interval contains zero. Therefore, there is no statistically significant difference between the mean scores of male and female students at the 5% significance level.`;

    const response = {
      success: true,
      message: "Request completed successfully",
      data: {
        project: "Civara",
        dataset: {
          fileName: req.file.originalname,
          totalRows: parsed.data.length,
          validRows: maleScores.length + femaleScores.length,
          removedRows: parsed.data.length - (maleScores.length + femaleScores.length),
          columns: headers,
          numericColumns: ["math score", "reading score", "writing score", "average score"].filter(c => normalizedHeaders.includes(c) || c === "average score")
        },
        analysis: {
          scoreType,
          groupVariable: "gender",
          groups: {
            male: {
              sampleSize: statsM.n,
              mean: formatNum(statsM.mean),
              standardDeviation: formatNum(statsM.stdDev),
              minimum: formatNum(statsM.min),
              maximum: formatNum(statsM.max),
            },
            female: {
              sampleSize: statsF.n,
              mean: formatNum(statsF.mean),
              standardDeviation: formatNum(statsF.stdDev),
              minimum: formatNum(statsF.min),
              maximum: formatNum(statsF.max),
            },
          },
          comparison: {
            meanDifference: formatNum(meanDiff),
            standardError: formatNum(se),
            degreesOfFreedom: formatNum(df),
            confidenceLevel: 0.95,
            confidenceInterval: {
              lower: formatNum(ciLower),
              upper: formatNum(ciUpper),
            },
            tStatistic: formatNum(tStat),
            pValue: Number(parseFloat(pValue.toString()).toFixed(5)),
            isSignificant,
          },
          interpretation,
        },
        visualization: {
          boxplot: {
            male: getBoxplotStats(maleScores),
            female: getBoxplotStats(femaleScores)
          },
          histogram: getHistogramStats(maleScores, femaleScores),
          barChart: {
            meanScores: [
              { group: "male", value: formatNum(statsM.mean) },
              { group: "female", value: formatNum(statsF.mean) }
            ],
            standardDeviation: [
              { group: "male", value: formatNum(statsM.stdDev) },
              { group: "female", value: formatNum(statsF.stdDev) }
            ]
          },
          confidenceIntervalPlot: {
            estimate: formatNum(meanDiff),
            lower: formatNum(ciLower),
            upper: formatNum(ciUpper),
            nullValue: 0,
            label: "Male - Female"
          }
        }
      },
      meta: null,
    };

    res.json(response);
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Analysis failed",
      data: null,
      meta: null,
      error: {
        code: "ANALYSIS_FAILED",
        message: "The server failed to complete the analysis.",
      },
    });
  }
});

app.use("/api/v1", apiRouter);

// --- Vite Middleware & Bootstrapping ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
