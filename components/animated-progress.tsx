"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface AnimatedProgressProps {
  value: number
  max?: number
  color?: string
  height?: number
  duration?: number
  showPercentage?: boolean
  className?: string
}

export function AnimatedProgress({
  value,
  max = 100,
  color = "#0ea5e9",
  height = 8,
  duration = 0.8,
  showPercentage = true,
  className = "",
}: AnimatedProgressProps) {
  const [percentage, setPercentage] = useState(0)
  const calculatedPercentage = (value / max) * 100

  useEffect(() => {
    // Animate the percentage counter
    const timer = setTimeout(() => {
      setPercentage(calculatedPercentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [calculatedPercentage])

  return (
    <div className={`w-full space-y-2 ${className}`}>
      {showPercentage && (
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <motion.span initial={{ value: 0 }} animate={{ value: percentage }} transition={{ duration }}>
              {Math.round(percentage)}%
            </motion.span>
          </motion.span>
        </div>
      )}
      <div className="overflow-hidden rounded-full bg-muted" style={{ height: `${height}px` }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration, ease: "easeInOut" }}
        />
      </div>
    </div>
  )
}
