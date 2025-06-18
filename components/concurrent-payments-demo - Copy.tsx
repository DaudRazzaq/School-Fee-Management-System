"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { AnimatedProgress } from "@/components/animated-progress"
import { AnimatedCounter } from "@/components/animated-counter"
import { slideUp, staggerChildren } from "@/lib/animation-utils"

// Component to demonstrate concurrent payment processing with animations
export function ConcurrentPaymentsDemo() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [progress, setProgress] = useState(0)

  // Process multiple payments concurrently
  const handleProcessConcurrentPayments = async () => {
    setIsProcessing(true)
    setResults([])
    setProgress(0)

    // Create 10 payment requests
    const payments = Array.from({ length: 10 }, (_, i) => ({
      studentId: `STU${(i + 1).toString().padStart(3, "0")}`,
      amount: 500,
      method: "credit",
    }))

    try {
      // Process all payments concurrently
      const startTime = Date.now()

      // Use Promise.all to process payments concurrently
      const results = await Promise.all(
        payments.map(async (payment, index) => {
          try {
            // Simulate varying processing times
            const processingTime = 500 + Math.random() * 1500
            await new Promise((resolve) => setTimeout(resolve, processingTime))

            // Update progress
            setProgress((prev) => Math.min(prev + 10, 100))

            return {
              success: true,
              paymentId: `PAY${Date.now()}${index}`,
              studentId: payment.studentId,
              amount: payment.amount,
              processingTime: processingTime.toFixed(0),
              timestamp: new Date().toLocaleTimeString(),
            }
          } catch (error) {
            return {
              success: false,
              studentId: payment.studentId,
              error: "Payment processing failed",
              timestamp: new Date().toLocaleTimeString(),
            }
          }
        }),
      )

      const totalTime = Date.now() - startTime

      setResults([{ type: "summary", totalTime, count: payments.length }, ...results])
    } catch (error) {
      console.error("Concurrent payments error:", error)
    } finally {
      setIsProcessing(false)
      setProgress(100)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Concurrent Payments Demo</CardTitle>
        <CardDescription>Process multiple payments simultaneously to demonstrate concurrent operations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
          <Button onClick={handleProcessConcurrentPayments} disabled={isProcessing} className="w-full">
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing 10 Payments Concurrently...
              </>
            ) : (
              "Process 10 Payments Concurrently"
            )}
          </Button>
        </motion.div>

        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <AnimatedProgress value={progress} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {results.length > 0 && (
            <motion.div initial="hidden" animate="visible" variants={staggerChildren(0.1)} className="mt-6 space-y-4">
              {results[0]?.type === "summary" && (
                <motion.div variants={slideUp}>
                  <Alert className="border-primary/20 bg-primary/5">
                    <AlertTitle className="flex items-center">
                      <span>Concurrent Processing Complete</span>
                      <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        <AnimatedCounter from={0} to={results[0].totalTime} duration={1} suffix="ms" />
                      </span>
                    </AlertTitle>
                    <AlertDescription>
                      Processed {results[0].count} payments in{" "}
                      <span className="font-medium">{results[0].totalTime}ms</span>
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <motion.div variants={slideUp} className="max-h-80 overflow-y-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left">Student ID</th>
                      <th className="p-2 text-left">Amount</th>
                      <th className="p-2 text-left">Processing Time</th>
                      <th className="p-2 text-left">Timestamp</th>
                      <th className="p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.slice(1).map((result, index) => (
                      <motion.tr
                        key={index}
                        className="border-b"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <td className="p-2">{result.studentId}</td>
                        <td className="p-2">${result.amount}</td>
                        <td className="p-2">{result.processingTime}ms</td>
                        <td className="p-2">{result.timestamp}</td>
                        <td className="p-2">
                          {result.success ? (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Success</span>
                          ) : (
                            <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">Failed</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }}>
          This demo shows how the system can handle multiple payment requests simultaneously using concurrent
          processing.
        </motion.div>
      </CardFooter>
    </Card>
  )
}
