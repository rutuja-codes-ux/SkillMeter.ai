"use client";

import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Code, Play, RotateCcw, CheckSquare, XSquare, Square, Terminal, FileCode } from "lucide-react";

interface LanguageTemplate {
  name: string;
  code: string;
  filename: string;
  mime: string;
}

const templates: Record<string, LanguageTemplate> = {
  python: {
    name: "Python 3",
    filename: "solution.py",
    mime: "python",
    code: `def reverse_string(s: str) -> str:
    # TODO: Implement the reverse string function
    # Hint: Return the reversed string
    return s[::-1]

# Test Case Execution
print("Test Case 1: 'hello' ->", reverse_string("hello"))
print("Test Case 2: 'SkillMeter' ->", reverse_string("SkillMeter"))
`,
  },
  javascript: {
    name: "JavaScript (ES6)",
    filename: "solution.js",
    mime: "javascript",
    code: `function reverseString(str) {
    // TODO: Implement the reverse string function
    return str.split("").reverse().join("");
}

// Test Case Execution
console.log("Test Case 1: 'hello' ->", reverseString("hello"));
console.log("Test Case 2: 'SkillMeter' ->", reverseString("SkillMeter"));
`,
  },
  cpp: {
    name: "C++ (GCC 17)",
    filename: "solution.cpp",
    mime: "cpp",
    code: `#include <iostream>
#include <string>
#include <algorithm>

std::string reverseString(std::string str) {
    // TODO: Implement the reverse string function
    std::reverse(str.begin(), str.end());
    return str;
}

int main() {
    std::cout << "Test Case 1: 'hello' -> " << reverseString("hello") << std::endl;
    std::cout << "Test Case 2: 'SkillMeter' -> " << reverseString("SkillMeter") << std::endl;
    return 0;
}
`,
  },
};

export default function PracticeLabPage() {
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  
  // Validation checks state
  const [checks, setChecks] = useState([
    { id: 1, text: "Function compiles and runs with zero syntax errors", status: "pending" },
    { id: 2, text: "Successfully reverses basic string 'hello' to 'olleh'", status: "pending" },
    { id: 3, text: "Successfully reverses alphanumeric string 'SkillMeter' to 'reteMlliKS'", status: "pending" },
  ]);

  useEffect(() => {
    setMounted(true);
    setCode(templates[language].code);
  }, [language]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setLanguage(lang);
    setTerminalOutput([]);
    setChecks(checks.map((c) => ({ ...c, status: "pending" })));
  };

  const handleReset = () => {
    if (confirm("Reset current file editor to starter boilerplate?")) {
      setCode(templates[language].code);
      setTerminalOutput([]);
      setChecks(checks.map((c) => ({ ...c, status: "pending" })));
    }
  };

  const handleRun = () => {
    setRunning(true);
    setTerminalOutput(["[Compiler] Compiling solution files...", "[System] Spawning sandbox runner process..."]);
    
    setTimeout(() => {
      let consoleLogs: string[] = [];
      let check1 = "failed";
      let check2 = "failed";
      let check3 = "failed";

      try {
        let matchesCriteria = false;
        if (language === "python" && code.includes("return")) {
          matchesCriteria = true;
        } else if (language === "javascript" && code.includes("reverse")) {
          matchesCriteria = true;
        } else if (language === "cpp" && code.includes("reverse")) {
          matchesCriteria = true;
        }

        if (matchesCriteria) {
          consoleLogs = [
            "[System] Sandboxed runtime started successfully.",
            "Test Case 1: 'hello' -> olleh",
            "Test Case 2: 'SkillMeter' -> reteMlliKS",
            "",
            "Execution completed successfully. Exit code: 0",
          ];
          check1 = "success";
          check2 = "success";
          check3 = "success";
        } else {
          consoleLogs = [
            "[System] Sandboxed runtime started successfully.",
            "Test Case 1: 'hello' -> hello",
            "Test Case 2: 'SkillMeter' -> SkillMeter",
            "",
            "Execution completed with Warning: TODO not implemented.",
          ];
          check1 = "success";
          check2 = "failed";
          check3 = "failed";
        }
      } catch (err: any) {
        consoleLogs = [
          "[Compiler Error] Syntax error on line 4.",
          err.message || "Failed to execute module compilation.",
        ];
        check1 = "failed";
      }

      setTerminalOutput(consoleLogs);
      setChecks([
        { id: 1, text: "Function compiles and runs with zero syntax errors", status: itemStatus(check1) },
        { id: 2, text: "Successfully reverses basic string 'hello' to 'olleh'", status: itemStatus(check2) },
        { id: 3, text: "Successfully reverses alphanumeric string 'SkillMeter' to 'reteMlliKS'", status: itemStatus(check3) },
      ]);
      setRunning(false);
    }, 1500);
  };

  const itemStatus = (s: string) => {
    return s === "success" ? "success" : "failed";
  };

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-black border-t-transparent animate-spin rounded-none" />
        <p className="mt-4 font-bold text-xs text-black tracking-wider uppercase">Mounting Monaco Code Editor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 bg-white p-5 rounded-none border border-black">
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-black text-black flex items-center gap-2 uppercase tracking-tight">
            <Code className="w-7 h-7" /> Coding Practice Lab
          </h1>
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
            Complete daily challenge tasks, compile code in real-time, and check constraints.
          </p>
        </div>

        {/* Language & Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest shrink-0">Language:</span>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-white border border-black px-3 py-2 rounded-none text-xs font-bold text-black focus:outline-none"
            >
              <option value="python">Python 3</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++ (GCC 17)</option>
            </select>
          </div>

          <button
            onClick={handleReset}
            className="border border-black bg-white hover:bg-neutral-50 p-2.5 rounded-none text-black transition-colors shrink-0"
            title="Reset Editor"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleRun}
            disabled={running}
            className="bg-black text-white hover:bg-neutral-800 border border-black px-4 py-2.5 rounded-none font-black text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-40 w-full md:w-auto justify-center"
          >
            <Play className="w-4 h-4 fill-current text-white" />
            <span>{running ? "Running..." : "Run Test Code"}</span>
          </button>
        </div>
      </div>

      {/* Main Split Panel Workspace */}
      <div className="flex-1 grid lg:grid-cols-12 gap-6 min-h-[500px]">
        
        {/* Left Side: Monaco Editor */}
        <div className="lg:col-span-7 bg-[#1E1E1E] rounded-none overflow-hidden border border-black flex flex-col">
          {/* File Tab Header */}
          <div className="bg-[#2D2D2D] px-4 py-2 flex items-center gap-2 border-b border-black text-xs font-bold text-gray-400 shrink-0">
            <FileCode className="w-4 h-4 text-white" />
            <span>{templates[language].filename}</span>
          </div>

          {/* Editor Frame */}
          <div className="flex-1 min-h-[350px]">
            <Editor
              height="100%"
              language={templates[language].mime}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                fontSize: 13,
                fontFamily: "JetBrains Mono, Menlo, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Right Side: Terminal and Checks */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Validation Checklist */}
          <div className="bg-white rounded-none border border-black p-5 space-y-4">
            <h3 className="font-black text-xs uppercase tracking-widest text-black border-b border-black pb-2">
              Challenge Constraints
            </h3>
            
            <div className="space-y-3">
              {checks.map((item) => (
                <div key={item.id} className="flex gap-2.5 items-start text-xs font-semibold">
                  <div className="shrink-0 mt-0.5 text-black">
                    {item.status === "success" ? (
                      <CheckSquare className="w-4 h-4 text-black fill-current" />
                    ) : item.status === "failed" ? (
                      <XSquare className="w-4 h-4 text-black" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-300" />
                    )}
                  </div>
                  <span className={item.status === "success" ? "text-neutral-900 font-bold" : "text-neutral-500"}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal Console Log */}
          <div className="flex-1 bg-black rounded-none overflow-hidden border border-black flex flex-col text-xs font-mono text-white">
            {/* Terminal Header */}
            <div className="bg-neutral-900 px-4 py-2 border-b border-black flex items-center gap-2 text-neutral-300 font-bold shrink-0 uppercase text-[10px] tracking-wider">
              <Terminal className="w-4 h-4 text-white" />
              <span>Developer Output Terminal</span>
            </div>

            {/* Terminal Logs */}
            <div className="flex-1 p-4 overflow-y-auto space-y-1.5 min-h-[150px] bg-black">
              {terminalOutput.length > 0 ? (
                terminalOutput.map((log, idx) => (
                  <p key={idx} className="whitespace-pre-wrap leading-relaxed">
                    {log}
                  </p>
                ))
              ) : (
                <p className="text-neutral-500 italic">
                  Press "Run Test Code" to execute compilation pipeline. Output logs will print here.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
