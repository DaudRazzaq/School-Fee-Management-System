"use client"

import { useState, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, FileText, PieChart } from "lucide-react"
import { generateReport } from "@/app/actions/payment-actions"
import { AnimatedCard } from "@/components/animated-card"
import { AnimatedCounter } from "@/components/animated-counter"
import { slideUp, slideInLeft, slideInRight } from "@/lib/animation-utils"

// Report generator component with animations
export function ReportGenerator() {
  const [reportType, setReportType] = useState("monthly")
  const [isPending, startTransition] = useTransition()
  const [report, setReport] = useState<any>(null)

  // Generate report using server action
  const handleGenerateReport = () => {
    startTransition(async () => {
      try {
        const result = await generateReport(reportType)
        setReport(result)
      } catch (error) {
        console.error("Report generation error:", error)
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Reports</CardTitle>
        <CardDescription>Generate financial reports without interrupting other system operations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div initial="hidden" animate="visible" variants={slideUp} className="flex items-end gap-4">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Report</SelectItem>
                <SelectItem value="weekly">Weekly Report</SelectItem>
                <SelectItem value="monthly">Monthly Report</SelectItem>
                <SelectItem value="yearly">Yearly Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={handleGenerateReport} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Report"
              )}
            </Button>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {report && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, height: 0 }}
              variants={slideUp}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <motion.div variants={slideInLeft}>
                <AnimatedCard
                  header={{
                    title: (
                      <div className="flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-primary" />
                        <span>{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</span>
                      </div>
                    ),
                    description: `Generated at ${new Date(report.generatedAt).toLocaleString()}`,
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                      <span className="font-medium">Total Payments:</span>
                      <AnimatedCounter from={0} to={report.totalPayments} className="text-xl font-bold" />
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                      <span className="font-medium">Total Amount:</span>
                      <AnimatedCounter
                        from={0}
                        to={report.totalAmount}
                        prefix="$"
                        formatter={(value) => value.toFixed(2)}
                        className="text-xl font-bold"
                      />
                    </div>
                  </div>
                </AnimatedCard>
              </motion.div>

              <motion.div variants={slideInRight}>
                <AnimatedCard
                  header={{
                    title: (
                      <div className="flex items-center">
                        <PieChart className="mr-2 h-5 w-5 text-primary" />
                        <span>Payment Methods</span>
                      </div>
                    ),
                  }}
                >
                  <ul className="space-y-2">
                    {Object.entries(report.paymentsByMethod).map(([method, count]: [string, any], index) => (
                      <motion.li
                        key={method}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                      >
                        <span className="font-medium capitalize">{method}:</span>
                        <div className="flex items-center">
                          <AnimatedCounter from={0} to={count} className="text-lg font-medium" />
                          <span className="ml-1 text-sm text-muted-foreground">payments</span>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </AnimatedCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }}>
          Reports are generated asynchronously and won't block other system operations.
        </motion.div>
      </CardFooter>
    </Card>
  )
}
