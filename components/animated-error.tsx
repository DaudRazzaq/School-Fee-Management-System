"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AlertCircle } from "lucide-react"

interface AnimatedErrorProps {
  message: string
  subMessage?: string
  onComplete?: () => void
  duration?: number
}

export function AnimatedError({ message, subMessage, onComplete, duration = 2000 }: AnimatedErrorProps) {
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComplete(true)
      if (onComplete) {
        onComplete()
      }
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onComplete])

  const circleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  const shakeVariants = {
    hidden: { x: 0 },
    visible: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  }

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: 0.6, ease: "easeOut" },
    },
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-10 text-center"
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100"
        variants={circleVariants}
      >
        <motion.div variants={shakeVariants}>
          <AlertCircle className="h-8 w-8 text-red-600" />
        </motion.div>
      </motion.div>
      <motion.h3 className="mb-2 text-xl font-bold" variants={textVariants}>
        {message}
      </motion.h3>
      {subMessage && (
        <motion.p className="mb-6 text-muted-foreground" variants={textVariants}>
          {subMessage}
        </motion.p>
      )}
    </motion.div>
  )
}
