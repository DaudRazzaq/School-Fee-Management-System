"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import DashboardLayout from "@/components/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConcurrentPaymentsDemo } from "@/components/concurrent-payments-demo"
import { ReportGenerator } from "@/components/report-generator"

export default function ConcurrentDemoPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your dashboard</p>
        </div>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <DashboardLayout>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <motion.div variants={itemVariants}>
          <h2 className="text-3xl font-bold tracking-tight">Concurrent Operations Demo</h2>
          <p className="text-muted-foreground">Explore how the system handles multiple operations simultaneously</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Tabs defaultValue="payments" className="space-y-4">
            <TabsList>
              <TabsTrigger value="payments">Concurrent Payments</TabsTrigger>
              <TabsTrigger value="reports">Report Generation</TabsTrigger>
            </TabsList>
            <TabsContent value="payments" className="space-y-4">
              <ConcurrentPaymentsDemo />
            </TabsContent>
            <TabsContent value="reports" className="space-y-4">
              <ReportGenerator />
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
