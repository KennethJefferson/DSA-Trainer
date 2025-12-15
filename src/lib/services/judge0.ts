/**
 * Judge0 Code Execution Service
 * Handles code execution via Judge0 CE API (RapidAPI)
 */

// Language ID mapping for Judge0
export const LANGUAGE_IDS: Record<string, number> = {
  javascript: 63,  // Node.js
  typescript: 74,  // TypeScript
  python: 71,      // Python 3
  python3: 71,
  java: 62,        // Java (OpenJDK 13)
  cpp: 54,         // C++ (GCC 9.2.0)
  "c++": 54,
  c: 50,           // C (GCC 9.2.0)
  csharp: 51,      // C# (Mono 6.6.0)
  "c#": 51,
  go: 60,          // Go (1.13.5)
  rust: 73,        // Rust (1.40.0)
  ruby: 72,        // Ruby (2.7.0)
  php: 68,         // PHP (7.4.1)
  swift: 83,       // Swift (5.2.3)
  kotlin: 78,      // Kotlin (1.3.70)
  scala: 81,       // Scala (2.13.2)
  sql: 82,         // SQL (SQLite 3.27.2)
};

// Status IDs for Judge0 submissions
export enum SubmissionStatus {
  InQueue = 1,
  Processing = 2,
  Accepted = 3,
  WrongAnswer = 4,
  TimeLimitExceeded = 5,
  CompilationError = 6,
  RuntimeError_SIGSEGV = 7,
  RuntimeError_SIGXFSZ = 8,
  RuntimeError_SIGFPE = 9,
  RuntimeError_SIGABRT = 10,
  RuntimeError_NZEC = 11,
  RuntimeError_Other = 12,
  InternalError = 13,
  ExecFormatError = 14,
}

export interface ExecutionRequest {
  code: string;
  language: string;
  stdin?: string;
  expectedOutput?: string;
  timeLimit?: number;  // seconds
  memoryLimit?: number; // KB
}

export interface ExecutionResult {
  status: {
    id: number;
    description: string;
  };
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;  // execution time in seconds
  memory: number | null; // memory usage in KB
  token?: string;
  message?: string | null;
}

export interface TestCaseResult {
  id: string;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  executionTime: string | null;
  error?: string;
}

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || "";

/**
 * Submit code to Judge0 for execution
 */
export async function submitCode(request: ExecutionRequest): Promise<string> {
  const languageId = LANGUAGE_IDS[request.language.toLowerCase()];

  if (!languageId) {
    throw new Error(`Unsupported language: ${request.language}`);
  }

  const response = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=false`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": JUDGE0_API_KEY,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    },
    body: JSON.stringify({
      source_code: Buffer.from(request.code).toString("base64"),
      language_id: languageId,
      stdin: request.stdin ? Buffer.from(request.stdin).toString("base64") : undefined,
      expected_output: request.expectedOutput
        ? Buffer.from(request.expectedOutput).toString("base64")
        : undefined,
      cpu_time_limit: request.timeLimit || 2,
      memory_limit: request.memoryLimit || 128000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Judge0 submission failed: ${error}`);
  }

  const data = await response.json();
  return data.token;
}

/**
 * Get submission result from Judge0
 */
export async function getSubmissionResult(token: string): Promise<ExecutionResult> {
  const response = await fetch(
    `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=true&fields=status,stdout,stderr,compile_output,time,memory,message`,
    {
      headers: {
        "X-RapidAPI-Key": JUDGE0_API_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get submission result: ${error}`);
  }

  const data = await response.json();

  // Decode base64 outputs
  return {
    status: data.status,
    stdout: data.stdout ? Buffer.from(data.stdout, "base64").toString("utf-8") : null,
    stderr: data.stderr ? Buffer.from(data.stderr, "base64").toString("utf-8") : null,
    compile_output: data.compile_output
      ? Buffer.from(data.compile_output, "base64").toString("utf-8")
      : null,
    time: data.time,
    memory: data.memory,
    token,
    message: data.message,
  };
}

/**
 * Submit and wait for result (with polling)
 */
export async function executeCode(
  request: ExecutionRequest,
  maxWaitTime: number = 30000
): Promise<ExecutionResult> {
  const token = await submitCode(request);

  const startTime = Date.now();
  const pollInterval = 1000; // 1 second

  while (Date.now() - startTime < maxWaitTime) {
    const result = await getSubmissionResult(token);

    // Check if processing is complete
    if (result.status.id > SubmissionStatus.Processing) {
      return result;
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error("Execution timed out");
}

/**
 * Run multiple test cases against the code
 */
export async function runTestCases(
  code: string,
  language: string,
  testCases: Array<{ id: string; input: string; expectedOutput: string }>,
  timeLimit?: number
): Promise<TestCaseResult[]> {
  const results: TestCaseResult[] = [];

  for (const testCase of testCases) {
    try {
      const result = await executeCode({
        code,
        language,
        stdin: testCase.input,
        expectedOutput: testCase.expectedOutput,
        timeLimit,
      });

      const actualOutput = (result.stdout || "").trim();
      const expectedOutput = testCase.expectedOutput.trim();
      const passed = actualOutput === expectedOutput;

      results.push({
        id: testCase.id,
        passed,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput,
        executionTime: result.time,
        error: result.stderr || result.compile_output || undefined,
      });
    } catch (error) {
      results.push({
        id: testCase.id,
        passed: false,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: "",
        executionTime: null,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

/**
 * Check if code passes all test cases
 */
export function allTestsPassed(results: TestCaseResult[]): boolean {
  return results.length > 0 && results.every(r => r.passed);
}

/**
 * Calculate partial score (percentage of passed tests)
 */
export function calculatePartialScore(results: TestCaseResult[]): number {
  if (results.length === 0) return 0;
  const passed = results.filter(r => r.passed).length;
  return Math.round((passed / results.length) * 100);
}
