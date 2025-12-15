"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/cn";
import { Button, Icon, Card } from "@/components/ui";
import type { BaseQuestionProps, DebuggingContent } from "./types";

// Dynamic import Monaco to avoid SSR issues
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface Props extends BaseQuestionProps {
  question: BaseQuestionProps["question"] & {
    content: DebuggingContent;
  };
}

interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  error?: string;
  executionTime?: string | null;
}

export function DebuggingQuestion({
  question,
  onAnswer,
  disabled = false,
  showResult = false,
  userAnswer,
}: Props) {
  const content = question.content;

  const [code, setCode] = useState<string>(
    (userAnswer as string) || content.buggyCode
  );
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>("");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showHints, setShowHints] = useState(false);

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
      // Call the execute API with test cases
      const response = await fetch("/api/execute?mode=test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: content.language,
          testCases: content.testCases.map((tc, i) => ({
            id: `test-${i}`,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
          })),
          timeLimit: question.timeLimit ? Math.min(question.timeLimit, 10) : 5,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setOutput(`Error: ${data.error || "Execution failed"}`);
        return;
      }

      // Map API results
      const results: TestResult[] = data.testResults.map((r: {
        input: string;
        expectedOutput: string;
        actualOutput: string;
        passed: boolean;
        error?: string;
        executionTime?: string | null;
      }) => ({
        input: r.input,
        expected: r.expectedOutput,
        actual: r.actualOutput,
        passed: r.passed,
        error: r.error,
        executionTime: r.executionTime,
      }));

      setTestResults(results);

      // Generate output
      const passedCount = results.filter(r => r.passed).length;
      const totalCount = results.length;

      const outputLines = results.map((r, i) => {
        const status = r.passed ? "PASS" : "FAIL";
        let line = `[${status}] Test ${i + 1}`;
        if (r.executionTime) line += ` (${r.executionTime}s)`;
        line += `\n  Input: ${r.input}\n  Expected: ${r.expected}`;
        if (r.actual) line += `\n  Actual: ${r.actual}`;
        if (r.error) line += `\n  Error: ${r.error}`;
        return line;
      });

      setOutput(
        `Test Results: ${passedCount}/${totalCount} passed\n\n` +
        outputLines.join("\n\n")
      );
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsRunning(false);
    }
  };

  const resetCode = () => {
    setCode(content.buggyCode);
    onAnswer(content.buggyCode);
    setTestResults([]);
    setOutput("");
  };

  // Calculate which bugs have been fixed
  const codeLines = code.split("\n");
  const bugStatus = content.bugs.map((bug) => {
    const currentLine = codeLines[bug.lineNumber - 1]?.trim();
    const correctLine = bug.correctCode.trim();
    return {
      ...bug,
      isFixed: currentLine === correctLine,
    };
  });

  const fixedCount = bugStatus.filter((b) => b.isFixed).length;
  const passedTests = testResults.filter(r => r.passed).length;
  const hasResults = testResults.length > 0;

  return (
    <div className="space-y-4">
      {/* Problem description */}
      <div className="p-4 rounded-xl bg-surface border border-surface-border">
        <div className="flex items-start gap-3">
          <Icon name="bug_report" className="text-error mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-white mb-1">Debug Challenge</h3>
            <p className="text-sm text-text-muted">{content.prompt}</p>
          </div>
        </div>
      </div>

      {/* Bug counter and test status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-muted">
            Bugs found:{" "}
            <span
              className={cn(
                "font-bold",
                fixedCount === content.bugs.length ? "text-success" : "text-warning"
              )}
            >
              {fixedCount}/{content.bugs.length}
            </span>
          </span>
          {hasResults && (
            <span className="text-sm text-text-muted">
              Tests:{" "}
              <span
                className={cn(
                  "font-bold",
                  passedTests === testResults.length ? "text-success" : "text-error"
                )}
              >
                {passedTests}/{testResults.length}
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!disabled && (
            <>
              <Button variant="ghost" size="sm" onClick={() => setShowHints(!showHints)}>
                <Icon name="lightbulb" size="sm" className="mr-1" />
                {showHints ? "Hide Hints" : "Show Hints"}
              </Button>
              <Button variant="ghost" size="sm" onClick={resetCode}>
                <Icon name="refresh" size="sm" className="mr-1" />
                Reset
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Hints */}
      {showHints && (
        <Card variant="bordered" className="!p-4 border-warning/50">
          <h4 className="text-sm font-medium text-warning mb-2 flex items-center gap-2">
            <Icon name="lightbulb" size="sm" />
            Bug Hints
          </h4>
          <ul className="space-y-2 text-sm text-text-muted">
            {content.bugs.map((bug, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className={cn(
                    "flex-shrink-0 w-5 h-5 rounded-full text-xs flex items-center justify-center",
                    bugStatus[i].isFixed
                      ? "bg-success text-white"
                      : "bg-surface-light text-text-muted"
                  )}
                >
                  {bugStatus[i].isFixed ? "✓" : i + 1}
                </span>
                <span>
                  Line {bug.lineNumber}: {bug.bugDescription}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Code Editor */}
      <div className="rounded-xl overflow-hidden border border-surface-border">
        <div className="bg-[#1e1e1e] px-4 py-2 flex items-center justify-between border-b border-surface-border">
          <span className="text-xs text-text-muted font-mono">
            {content.language} - Fix the bugs!
          </span>
          {!disabled && (
            <Button size="sm" onClick={runTests} isLoading={isRunning} className="text-xs">
              <Icon name="play_arrow" size="sm" className="mr-1" />
              Test Code
            </Button>
          )}
        </div>
        <Editor
          height="300px"
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
            glyphMargin: true,
          }}
        />
      </div>

      {/* Test Cases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {content.testCases.map((testCase, i) => {
          const result = testResults[i];

          return (
            <Card
              key={i}
              variant="elevated"
              className={cn(
                "!p-3",
                result?.passed && "border-success",
                result && !result.passed && "border-error"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-text-muted">
                  Test Case {i + 1}
                </h4>
                {result && (
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
                )}
              </div>
              <div className="space-y-1 text-xs font-mono">
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
            </Card>
          );
        })}
      </div>

      {/* Output */}
      {output && (
        <div className="rounded-xl overflow-hidden border border-surface-border bg-[#0d1117]">
          <div className="px-4 py-2 bg-[#161b22] border-b border-surface-border">
            <span className="text-xs text-text-muted">Test Results</span>
          </div>
          <pre className="p-4 text-sm text-gray-300 font-mono whitespace-pre-wrap">
            {output}
          </pre>
        </div>
      )}

      {/* Solution (shown after submission) */}
      {showResult && (
        <Card variant="bordered" className="!p-4 border-success/50">
          <h4 className="text-sm font-medium text-success mb-2 flex items-center gap-2">
            <Icon name="check_circle" size="sm" />
            Correct Solution
          </h4>
          <div className="space-y-2 text-sm">
            {content.bugs.map((bug, i) => (
              <div key={i} className="font-mono text-xs">
                <span className="text-text-muted">Line {bug.lineNumber}: </span>
                <code className="text-success">{bug.correctCode}</code>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
