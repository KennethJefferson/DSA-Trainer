import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  executeCode,
  runTestCases,
  LANGUAGE_IDS,
  type ExecutionResult,
  type TestCaseResult,
} from "@/lib/services/judge0";
import { z } from "zod";

// Validate execution request
const executeSchema = z.object({
  code: z.string().min(1, "Code is required"),
  language: z.string().refine(
    (lang) => lang.toLowerCase() in LANGUAGE_IDS,
    "Unsupported programming language"
  ),
  stdin: z.string().optional(),
  timeLimit: z.number().min(1).max(10).optional(),
  memoryLimit: z.number().min(1024).max(512000).optional(),
});

// Validate test cases request
const testCasesSchema = z.object({
  code: z.string().min(1, "Code is required"),
  language: z.string().refine(
    (lang) => lang.toLowerCase() in LANGUAGE_IDS,
    "Unsupported programming language"
  ),
  testCases: z.array(z.object({
    id: z.string(),
    input: z.string(),
    expectedOutput: z.string(),
  })).min(1, "At least one test case is required"),
  timeLimit: z.number().min(1).max(10).optional(),
});

export interface ExecuteResponse {
  success: boolean;
  result?: ExecutionResult;
  testResults?: TestCaseResult[];
  error?: string;
}

// POST /api/execute - Execute code or run test cases
export async function POST(request: NextRequest): Promise<NextResponse<ExecuteResponse>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "execute";

    if (mode === "test") {
      // Run test cases
      const validation = testCasesSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: validation.error.errors[0].message },
          { status: 400 }
        );
      }

      const { code, language, testCases, timeLimit } = validation.data;

      // Check if Judge0 API key is configured
      if (!process.env.JUDGE0_API_KEY) {
        // Return simulated results for demo mode
        const simulatedResults: TestCaseResult[] = testCases.map(tc => ({
          id: tc.id,
          passed: false,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: "[Demo mode - Judge0 API not configured]",
          executionTime: null,
          error: "Code execution requires Judge0 API configuration. Set JUDGE0_API_KEY in .env",
        }));

        return NextResponse.json({
          success: true,
          testResults: simulatedResults,
        });
      }

      const testResults = await runTestCases(code, language, testCases, timeLimit);

      return NextResponse.json({
        success: true,
        testResults,
      });
    } else {
      // Simple execution
      const validation = executeSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: validation.error.errors[0].message },
          { status: 400 }
        );
      }

      const { code, language, stdin, timeLimit, memoryLimit } = validation.data;

      // Check if Judge0 API key is configured
      if (!process.env.JUDGE0_API_KEY) {
        return NextResponse.json({
          success: true,
          result: {
            status: { id: 13, description: "Demo Mode" },
            stdout: "[Demo mode - Judge0 API not configured]\nSet JUDGE0_API_KEY in .env to enable code execution.",
            stderr: null,
            compile_output: null,
            time: null,
            memory: null,
          },
        });
      }

      const result = await executeCode({
        code,
        language,
        stdin,
        timeLimit,
        memoryLimit,
      });

      return NextResponse.json({
        success: true,
        result,
      });
    }
  } catch (error) {
    console.error("Code execution error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Code execution failed",
      },
      { status: 500 }
    );
  }
}

// GET /api/execute/languages - Get supported languages
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    languages: Object.entries(LANGUAGE_IDS).map(([name, id]) => ({
      name,
      id,
    })),
  });
}
