"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface AnimatedCardProps {
  children: React.ReactNode
  header?: {
    title?: React.ReactNode
    description?: React.ReactNode
  }
  footer?: React.ReactNode
  delay?: number
  className?: string
}

export function AnimatedCard({ children, header, footer, delay = 0, className = "" }: AnimatedCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay,
        ease: "easeOut",
      },
    },
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      className={className}
    >
      <Card className="h-full">
        {header && (
          <CardHeader>
            {header.title && <CardTitle>{header.title}</CardTitle>}
            {header.description && <CardDescription>{header.description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>{children}</CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    </motion.div>
  )
}
