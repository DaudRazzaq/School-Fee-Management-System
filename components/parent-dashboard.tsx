"use client"

import { useState } from "react"
import { Calendar, CreditCard, DollarSign, Receipt } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Chart } from "@/components/ui/chart"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { PaymentForm } from "@/components/payment-form"

// Mock data for charts
const paymentHistoryData = [
  { month: "Jan", amount: 500 },
  { month: "Feb", amount: 500 },
  { month: "Mar", amount: 500 },
  { month: "Apr", amount: 500 },
  { month: "May", amount: 500 },
  { month: "Jun", amount: 500 },
  { month: "Jul", amount: 500 },
  { month: "Aug", amount: 0 },
  { month: "Sep", amount: 0 },
  { month: "Oct", amount: 0 },
  { month: "Nov", amount: 0 },
  { month: "Dec", amount: 0 },
]

// Mock data for upcoming payments
const upcomingPayments = [
  {
    id: 1,
    title: "August Tuition Fee",
    amount: 500,
    dueDate: "2025-08-05",
    status: "pending",
  },
  {
    id: 2,
    title: "September Tuition Fee",
    amount: 500,
    dueDate: "2025-09-05",
    status: "upcoming",
  },
  {
    id: 3,
    title: "October Tuition Fee",
    amount: 500,
    dueDate: "2025-10-05",
    status: "upcoming",
  },
]

// Mock data for payment history
const recentPayments = [
  {
    id: 1,
    title: "July Tuition Fee",
    amount: 500,
    date: "2025-07-03",
    status: "completed",
    method: "Credit Card",
  },
  {
    id: 2,
    title: "June Tuition Fee",
    amount: 500,
    date: "2025-06-04",
    status: "completed",
    method: "Bank Transfer",
  },
  {
    id: 3,
    title: "May Tuition Fee",
    amount: 500,
    date: "2025-05-05",
    status: "completed",
    method: "Credit Card",
  },
]

// Parent Dashboard component
export function ParentDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)

  const handlePayNow = (payment: any) => {
    setSelectedPayment(payment)
    setShowPaymentForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Parent Dashboard</h2>
          <p className="text-muted-foreground">Manage your child's school fees and payments</p>
        </div>
      </div>

      {showPaymentForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Make Payment</CardTitle>
            <CardDescription>
              {selectedPayment?.title} - ${selectedPayment?.amount}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentForm
              payment={selectedPayment}
              onCancel={() => setShowPaymentForm(false)}
              onSuccess={() => {
                setShowPaymentForm(false)
                // In a real app, we would update the payment status here
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Payments</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$500</div>
                  <p className="text-xs text-muted-foreground">Due on August 5, 2025</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => handlePayNow(upcomingPayments[0])}>
                    Pay Now
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Paid (2025)</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$3,500</div>
                  <p className="text-xs text-muted-foreground">7 months completed</p>
                </CardContent>
                <CardFooter className="p-2">
                  <div className="w-full space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>Payment Progress</span>
                      <span>58%</span>
                    </div>
                    <Progress value={58} className="h-2" />
                  </div>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
                    >
                      Up to date
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">All payments are current</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Your payment history for the current year</CardDescription>
              </CardHeader>
              <CardContent>
                <Chart>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={paymentHistoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Chart>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Payments</CardTitle>
                <CardDescription>Scheduled payments for the upcoming months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <p className="font-medium">{payment.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Due on {new Date(payment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">${payment.amount}</p>
                          <Badge variant={payment.status === "pending" ? "destructive" : "outline"}>
                            {payment.status === "pending" ? "Due Soon" : "Upcoming"}
                          </Badge>
                        </div>
                        {payment.status === "pending" && <Button onClick={() => handlePayNow(payment)}>Pay Now</Button>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Record of all your previous payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <p className="font-medium">{payment.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Paid on {new Date(payment.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">${payment.amount}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <CreditCard className="h-3 w-3" />
                            <span>{payment.method}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Completed
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
