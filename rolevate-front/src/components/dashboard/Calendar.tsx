import React, { useState, useEffect } from "react";
import { CalendarDaysIcon, ClockIcon } from "@heroicons/react/24/outline";
import { DashboardEvent } from "@/services/dashboard";

export default function Calendar() {
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      // Events API not implemented yet - just show empty state
      setEvents([]);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: DashboardEvent["type"]) => {
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-300/70">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <CalendarDaysIcon className="w-5 h-5 text-[#0fc4b5]" />
            Upcoming Schedule
          </h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CalendarDaysIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No upcoming events</p>
            <p className="text-sm">Your schedule will appear here</p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 border border-gray-200/50"
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ClockIcon className="w-4 h-4" />
                  <span>
                    {event.date} at {event.time}
                  </span>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(
                  event.type
                )}`}
              >
                {event.type}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
