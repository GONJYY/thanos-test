import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { DayPicker } from "react-day-picker";
import { el } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  scheduleItems?: Array<{
    id: string;
    class: string;
    day: string;
    time: string;
    room?: string;
    day_of_week: number;
  }>;
  userRole?: "student" | "teacher" | "admin";
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  scheduleItems = [],
  userRole,
  ...props
}: CalendarProps) {
  const [hoveredDay, setHoveredDay] = React.useState<Date | null>(null);
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });

  // Function to check if a date has lessons
  const hasLessons = (date: Date) => {
    const dayOfWeek = date.getDay();
    return scheduleItems.some((item) => item.day_of_week === dayOfWeek);
  };

  // Function to get lessons for a specific date
  const getLessonsForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    return scheduleItems.filter((item) => item.day_of_week === dayOfWeek);
  };

  // Handle mouse enter on day cell
  const handleDayMouseEnter = (date: Date, event: React.MouseEvent) => {
    if (hasLessons(date)) {
      setHoveredDay(date);
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    }
  };

  // Handle mouse leave on day cell
  const handleDayMouseLeave = () => {
    setHoveredDay(null);
  };

  const modifiers = {
    hasLessons: (date: Date) => hasLessons(date),
  };

  const modifiersClassNames = {
    hasLessons:
      "bg-orange-100 text-orange-800 font-semibold border-2 border-orange-300 hover:bg-orange-200",
  };

  return (
    <div className="relative">
      <DayPicker
        locale={el}
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        classNames={{
          months:
            "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: cn(
            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
            props.mode === "range"
              ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
              : "[&:has([aria-selected])]:rounded-md",
          ),
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-8 w-8 p-0 font-normal aria-selected:opacity-100 cursor-pointer",
          ),
          day_range_start: "day-range-start",
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground opacity-50  aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ ...props }) => <ChevronLeftIcon className="h-4 w-4" />,
          IconRight: ({ ...props }) => <ChevronRightIcon className="h-4 w-4" />,
          Day: ({ date, ...dayProps }) => {
            const DayComponent = DayPicker.defaultProps?.components?.Day;
            return (
              <div
                onMouseEnter={(e) => handleDayMouseEnter(date, e)}
                onMouseLeave={handleDayMouseLeave}
                className="relative"
              >
                {DayComponent ? (
                  <DayComponent date={date} {...dayProps} />
                ) : (
                  <button
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "h-8 w-8 p-0 font-normal aria-selected:opacity-100 cursor-pointer",
                      hasLessons(date) &&
                        "bg-orange-100 text-orange-800 font-semibold border-2 border-orange-300 hover:bg-orange-200",
                    )}
                    {...dayProps}
                  >
                    {date.getDate()}
                  </button>
                )}
              </div>
            );
          },
        }}
        {...props}
      />

      {/* Tooltip for lesson information */}
      {hoveredDay && (
        <div
          className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px] pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="text-sm font-semibold text-gray-900 mb-2">
            Μαθήματα για{" "}
            {hoveredDay.toLocaleDateString("el-GR", { weekday: "long" })}
          </div>
          <div className="space-y-1">
            {getLessonsForDate(hoveredDay).map((lesson, index) => (
              <div key={index} className="text-xs text-gray-600">
                <div className="font-medium text-orange-600">
                  {lesson.class}
                </div>
                <div>{lesson.time}</div>
                {lesson.room && <div>Αίθουσα: {lesson.room}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
Calendar.displayName = "Ημερολόγιο";

export { Calendar };
