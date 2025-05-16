
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: number;
  className?: string;
  style?: React.CSSProperties;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
  style,
}) => {
  return (
    <Card 
      className={cn("shadow-sm hover:shadow-md transition-shadow duration-300", className)} 
      style={style}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
            {trend !== undefined && (
              <div className="flex items-center mt-2">
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded",
                    trend > 0
                      ? "text-green-800 bg-green-100"
                      : trend < 0
                      ? "text-red-800 bg-red-100"
                      : "text-gray-800 bg-gray-100"
                  )}
                >
                  {trend > 0 ? `+${trend}%` : trend < 0 ? `${trend}%` : "0%"}
                </span>
                <span className="text-xs text-muted-foreground ml-2">vs last quarter</span>
              </div>
            )}
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
