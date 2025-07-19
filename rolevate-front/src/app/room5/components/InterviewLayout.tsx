import React from "react";

export function InterviewLayout({
  children,
  header,
  videoPanel,
  aiAssistantPanel,
}: {
  children?: React.ReactNode;
  header: React.ReactNode;
  videoPanel: React.ReactNode;
  aiAssistantPanel: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      {header}
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-4 gap-4">
          {videoPanel}
          {children}
        </div>
        <div className="w-[380px] bg-white border-l border-slate-200 flex flex-col">
          {aiAssistantPanel}
        </div>
      </main>
    </div>
  );
}
