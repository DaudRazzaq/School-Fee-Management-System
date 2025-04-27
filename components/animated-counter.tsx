"use client"

import { useState, useEffect } from "react"
import { motion, useAnimation } from "framer-motion"

interface AnimatedCounterProps {
  from: number
  to: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
  formatter?: (value: number) => string
}

export function AnimatedCounter({
  from,
  to,
  duration = 1.5,
  prefix = "",
  suffix = "",
  className = "",
  formatter = (value) => value.toFixed(0),
}: AnimatedCounterProps) {
  const [count, setCount] = useState(from)
  const controls = useAnimation()

  useEffect(() => {
    controls.start({
      count: to,
      transition: { duration, ease: "easeOut" },
    })
  }, [controls, to, duration])

  useEffect(() => {
    const unsubscribe = controls.onChange("count", (latest) => {
      setCount(latest)
    })
    return unsubscribe
  }, [controls])

  return (
    <motion.span className={className} animate={controls}>
      {prefix}
      {formatter(count)}
      {suffix}
    </motion.span>
  )
}
