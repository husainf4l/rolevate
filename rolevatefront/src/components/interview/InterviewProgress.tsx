"use client";

interface InterviewProgressProps {
  callDuration: number;
  formatTime: (seconds: number) => string;
  status: string;
}

export const InterviewProgress = ({
  callDuration,
  formatTime,
  status,
}: InterviewProgressProps) => {
  // Total interview duration in seconds (30 minutes)
  const totalDuration = 1800;

  return (
    <div className="bg-slate-900/40 p-4 rounded-lg">
      <h3 className="text-sm font-semibold uppercase text-gray-400 mb-2">
        Interview Progress
      </h3>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Elapsed Time</span>
            <span>{formatTime(callDuration)}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full"
              style={{
                width: `${Math.min(
                  (callDuration / totalDuration) * 100,
                  100
                )}%`,
              }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Estimated Remaining</span>
            <span>{formatTime(Math.max(totalDuration - callDuration, 0))}</span>
          </div>
        </div>

        <div className="flex items-center mt-1 text-xs">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          <span>{status}</span>
        </div>
      </div>
    </div>
  );
};
