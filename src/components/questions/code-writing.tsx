"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/cn";
import { Button, Icon, Card } from "@/components/ui";
import type { BaseQuestionProps, CodeWritingContent } from "./types";

// Dynamic import Monaco to avoid SSR issues
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface Props extends BaseQuestionProps {
  question: BaseQuestionProps["question"] & {
    content: CodeWritingContent;
  };
}

interface TestResult {
  id: string;
  passed: boolean;
  input: string;
  expected: string;
  actual?: string;
  error?: string;
  executionTime?: string | null;
}

export function CodeWritingQuestion({
  question,
  onAnswer,
  disabled = false,
  showResult = false,
  userAnswer,
}: Props) {
  const content = question.content;

  const [code, setCode] = useState<string>(
    (userAnswer as string) || content.starterCode
  );
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [output, setOutput] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"code" | "tests" | "output">("code");

  useEffect(() => {
    if (userAnswer) {
      setCode(userAnswer as string);
    }
  }, [userAnswer]);

  const handleCodeChange = (value: string | undefined) => {
    if (disabled) return;
    const newCode = value || "";
    setCode(newCode);
    onAnswer(newCode);
  };

  const runTests = async () => {
    setIsRunning(true);
    setOutput("");
    setTestResults([]);

    try {
      // Get visible test cases
      const visibleTests = content.testCases.filter(tc => !tc.isHidden || showResult);

      // Call the execute API
      const response = await fetch("/api/execute?mode=test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: content.language,
          testCases: visibleTests.map(tc => ({
            id: tc.id,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
          })),
          timeLimit: question.timeLimit ? Math.min(question.timeLimit, 10) : 5,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setOutput(`Error: ${data.error || "Execution failed"}`);
        setActiveTab("output");
        return;
      }

      // Map API results to component state
      const results: TestResult[] = data.testResults.map((r: {
        id: string;
        passed: boolean;
        input: string;
        expectedOutput: string;
        actualOutput: string;
        executionTime?: string | null;
        error?: string;
      }) => ({
        id: r.id,
        passed: r.passed,
        input: r.input,
        expected: r.expectedOutput,
        actual: r.actualOutput,
        executionTime: r.executionTime,
        error: r.error,
      }));

      setTestResults(results);

      // Generate output summary
      const passed = results.filter(r => r.passed).length;
      const total = results.length;
      const summary = `Test Results: ${passed}/${total} passed\n\n`;
      const details = results.map((r, i) => {
        const status = r.passed ? "PASS" : "FAIL";
        let detail = `[${status}] Test ${i + 1}`;
        if (r.executionTime) detail += ` (${r.executionTime}s)`;
        if (!r.passed && r.error) detail += `\n  Error: ${r.error}`;
        return detail;
      }).join("\n");

      setOutput(summary + details);
      setActiveTab("tests");
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      setActiveTab("output");
    } finally {
      setIsRunning(false);
    }
  };

  const visibleTestCases = content.testCases.filter(
    (tc) => !tc.isHidden || showResult
  );

  const passedCount = testResults.filter(r => r.passed).length;
  const hasResults = testResults.length > 0;

  return (
    <div className="space-y-4">
      {/* Problem description */}
      <div className="prose prose-invert max-w-none">
        <div
          className="text-sm text-text-main leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: content.prompt.replace(/\n/g, "<br />"),
          }}
        />
      </div>

      {/* Constraints */}
      {content.constraints && content.constraints.length > 0 && (
        <div className="p-3 rounded-lg bg-surface border border-surface-border">
          <h4 className="text-xs font-medium text-text-muted mb-2">Constraints:</h4>
          <ul className="text-xs text-text-muted space-y-1">
            {content.constraints.map((constraint, i) => (
              <li key={i}>• {constraint}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-surface-border">
        {[
          { id: "code", label: "Code", icon: "code" },
          {
            id: "tests",
            label: `Tests (${hasResults ? `${passedCount}/${visibleTestCases.length}` : visibleTestCases.length})`,
            icon: "checklist",
          },
          { id: "output", label: "Output", icon: "terminal" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "px-4 py-2 text-sm font-medium flex items-center gap-2 border-b-2 -mb-[2px] transition-colors",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-white"
            )}
          >
            <Icon name={tab.icon} size="sm" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[400px]">
        {/* Code Editor */}
        {activeTab === "code" && (
          <div className="rounded-xl overflow-hidden border border-surface-border">
            <div className="bg-[#1e1e1e] px-4 py-2 flex items-center justify-between border-b border-surface-border">
              <span className="text-xs text-text-muted font-mono">
                {content.language}
              </span>
              {!disabled && (
                <Button
                  size="sm"
                  onClick={runTests}
                  isLoading={isRunning}
                  className="text-xs"
                >
                  <Icon name="play_arrow" size="sm" className="mr-1" />
                  Run Tests
                </Button>
              )}
            </div>
            <Editor
              height="350px"
              language={content.language.toLowerCase()}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                readOnly: disabled,
                scrollBeyondLastLine: false,
                wordWrap: "on",
                padding: { top: 16 },
              }}
            />
          </div>
        )}

        {/* Test Cases */}
        {activeTab === "tests" && (
          <div className="space-y-3">
            {visibleTestCases.map((testCase, index) => {
              const result = testResults.find((r) => r.id === testCase.id);

              return (
                <Card
                  key={testCase.id}
                  variant="elevated"
                  className={cn(
                    "!p-4",
                    result?.passed && "border-success",
                    result && !result.passed && "border-error"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-white">
                      Test Case {index + 1}
                      {testCase.isHidden && (
                        <span className="ml-2 text-xs text-text-muted">(hidden)</span>
                      )}
                    </h4>
                    {result && (
                      <div className="flex items-center gap-2">
                        {result.executionTime && (
                          <span className="text-xs text-text-muted">
                            {result.executionTime}s
                          </span>
                        )}
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded",
                            result.passed
                              ? "bg-success/20 text-success"
                              : "bg-error/20 text-error"
                          )}
                        >
                          {result.passed ? "Passed" : "Failed"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div>
                      <span className="text-text-muted">Input: </span>
                      <span className="text-white">{testCase.input}</span>
                    </div>
                    <div>
                      <span className="text-text-muted">Expected: </span>
                      <span className="text-success">{testCase.expectedOutput}</span>
                    </div>
                    {result?.actual && (
                      <div>
                        <span className="text-text-muted">Actual: </span>
                        <span className={result.passed ? "text-success" : "text-error"}>
                          {result.actual}
                        </span>
                      </div>
                    )}
                    {result?.error && (
                      <div className="mt-2 p-2 rounded bg-error/10 border border-error/30">
                        <span className="text-error">{result.error}</span>
                      </div>
                    )}
                  </div>

                  {testCase.explanation && (
                    <p className="mt-2 text-xs text-text-muted">
                      {testCase.explanation}
                    </p>
                  )}
                </Card>
              );
            })}

            {/* Run tests prompt if no results */}
            {!hasResults && (
              <div className="text-center py-8 text-text-muted">
                <Icon name="play_circle" size="xl" className="mb-2 opacity-50" />
                <p className="text-sm">Click "Run Tests" to execute your code</p>
              </div>
            )}
          </div>
        )}

        {/* Output */}
        {activeTab === "output" && (
          <div className="rounded-xl overflow-hidden border border-surface-border bg-[#0d1117]">
            <div className="px-4 py-2 bg-[#161b22] border-b border-surface-border">
              <span className="text-xs text-text-muted">Console Output</span>
            </div>
            <pre className="p-4 text-sm text-gray-300 font-mono whitespace-pre-wrap min-h-[300px]">
              {output || "Run your code to see output here..."}
            </pre>
          </div>
        )}
      </div>

      {/* Solution (shown after submission) */}
      {showResult && content.solutionCode && (
        <Card variant="bordered" className="!p-0 border-success/50 overflow-hidden">
          <div className="px-4 py-2 bg-success/10 border-b border-success/30">
            <h4 className="text-sm font-medium text-success flex items-center gap-2">
              <Icon name="check_circle" size="sm" />
              Solution
            </h4>
          </div>
          <pre className="p-4 text-sm text-gray-300 font-mono whitespace-pre-wrap bg-[#0d1117]">
            {content.solutionCode}
          </pre>
        </Card>
      )}
    </div>
  );
}
