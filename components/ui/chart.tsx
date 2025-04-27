import type React from "react"
export function Chart({ children }: { children: React.ReactNode }) {
  return <div className="relative">{children}</div>
}

export function ChartContainer({ children }: { children: React.ReactNode }) {
  return <div className="container">{children}</div>
}

export function ChartTooltip({ children }: { children: React.ReactNode }) {
  return <div className="tooltip">{children}</div>
}

export function ChartTooltipContent({ children }: { children: React.ReactNode }) {
  return <div className="tooltip-content">{children}</div>
}

export function ChartLegend({ children }: { children: React.ReactNode }) {
  return <div className="legend">{children}</div>
}

export function ChartLegendContent({ children }: { children: React.ReactNode }) {
  return <div className="legend-content">{children}</div>
}

export function ChartStyle({ children }: { children: React.ReactNode }) {
  return <style>{children}</style>
}
