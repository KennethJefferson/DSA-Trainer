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
      // In a real implementation, this would call Judge0 API
      // For now, we'll simulate test execution
      const results: TestResult[] = content.testCases
        .filter((tc) => !tc.isHidden || showResult)
        .map((testCase) => ({
          id: testCase.id,
          passed: false, // Would be determined by actual execution
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: "Execution not available in demo",
        }));

      setTestResults(results);
      setOutput("Code execution requires Judge0 API setup.\n\nYour code has been saved.");
      setActiveTab("output");
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsRunning(false);
    }
  };

  const visibleTestCases = content.testCases.filter(
    (tc) => !tc.isHidden || showResult
  );

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
          { id: "tests", label: `Tests (${visibleTestCases.length})`, icon: "checklist" },
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
                      <span
                        className={cn(
                          "text-xs font-medium",
                          result.passed ? "text-success" : "text-error"
                        )}
                      >
                        {result.passed ? "Passed" : "Failed"}
                      </span>
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
                  </div>

                  {testCase.explanation && (
                    <p className="mt-2 text-xs text-text-muted">
                      {testCase.explanation}
                    </p>
                  )}
                </Card>
              );
            })}
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
    </div>
  );
}
