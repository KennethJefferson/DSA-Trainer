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

interface BugFix {
  lineNumber: number;
  fixedCode: string;
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

    try {
      // Simulated test execution
      const results = content.testCases.map((tc, i) => ({
        input: tc.input,
        expected: tc.expectedOutput,
        passed: false, // Would be determined by actual execution
      }));

      const outputLines = results.map(
        (r, i) =>
          `Test ${i + 1}: ${r.passed ? "✓ Passed" : "✗ Failed"}\n  Input: ${r.input}\n  Expected: ${r.expected}`
      );

      setOutput(
        outputLines.join("\n\n") +
          "\n\n---\nCode execution requires Judge0 API setup."
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

      {/* Bug counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
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
        {content.testCases.map((testCase, i) => (
          <Card key={i} variant="elevated" className="!p-3">
            <h4 className="text-xs font-medium text-text-muted mb-2">
              Test Case {i + 1}
            </h4>
            <div className="space-y-1 text-xs font-mono">
              <div>
                <span className="text-text-muted">Input: </span>
                <span className="text-white">{testCase.input}</span>
              </div>
              <div>
                <span className="text-text-muted">Expected: </span>
                <span className="text-success">{testCase.expectedOutput}</span>
              </div>
            </div>
          </Card>
        ))}
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
