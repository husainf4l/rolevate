import React from "react";
import { CalendarDaysIcon, ClockIcon } from "@heroicons/react/24/outline";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "interview" | "deadline" | "meeting";
}

const events: CalendarEvent[] = [
  {
    id: "1",
    title: "Interview with Sarah Johnson",
    date: "Today",
    time: "2:00 PM",
    type: "interview"
  },
  {
    id: "2",
    title: "Job posting deadline - Senior Dev",
    date: "Tomorrow",
    time: "11:59 PM",
    type: "deadline"
  },
  {
    id: "3",
    title: "Team meeting - Hiring Strategy",
    date: "Dec 12",
    time: "10:00 AM",
    type: "meeting"
  },
  {
    id: "4",
    title: "Interview with Mike Chen",
    date: "Dec 15",
    time: "3:30 PM",
    type: "interview"
  }
];

const getTypeColor = (type: CalendarEvent["type"]) => {
  switch (type) {
    case "interview":
      return "bg-blue-100 text-blue-800";
    case "deadline":
      return "bg-red-100 text-red-800";
    case "meeting":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function Calendar() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-300/70">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <CalendarDaysIcon className="w-5 h-5 text-[#0fc4b5]" />
          Upcoming Schedule
        </h2>
        <button className="text-sm text-[#0fc4b5] hover:text-[#0891b2] font-medium">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 border border-gray-200/50"
          >
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">{event.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ClockIcon className="w-4 h-4" />
                <span>{event.date} at {event.time}</span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(event.type)}`}>
              {event.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}