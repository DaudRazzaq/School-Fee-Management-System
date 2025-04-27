"use server"

import { revalidatePath } from "next/cache"

// Simulating a database with concurrent access
const processingPayments = new Set()
const paymentDatabase: any[] = []

// Atomic counter for payment IDs
let paymentIdCounter = 0

// Function to get a unique payment ID atomically
function getNextPaymentId() {
  return `PAY${Date.now()}-${paymentIdCounter++}`
}

// Process payment with concurrency handling
export async function processPayment(formData: FormData) {
  const studentId = formData.get("studentId") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const method = formData.get("method") as string

  if (!studentId || isNaN(amount) || amount <= 0) {
    return {
      success: false,
      message: "Invalid payment data",
    }
  }

  // Check if this payment is already being processed (prevent double submission)
  const paymentKey = `${studentId}-${amount}-${Date.now()}`
  if (processingPayments.has(paymentKey)) {
    return {
      success: false,
      message: "Payment is already being processed",
    }
  }

  try {
    // Mark this payment as being processed
    processingPayments.add(paymentKey)

    // Simulate payment gateway processing (async operation)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate payment ID atomically
    const paymentId = getNextPaymentId()

    // Create payment record
    const payment = {
      id: paymentId,
      studentId,
      amount,
      method,
      date: new Date().toISOString(),
      status: "completed",
    }

    // Add to database (in a real app, this would be a database transaction)
    paymentDatabase.push(payment)

    // Revalidate the payments page to show updated data
    revalidatePath("/dashboard/payments")

    return {
      success: true,
      paymentId,
      message: "Payment processed successfully",
    }
  } catch (error) {
    console.error("Payment processing error:", error)
    return {
      success: false,
      message: "Payment processing failed",
    }
  } finally {
    // Always remove from processing set
    processingPayments.delete(paymentKey)
  }
}

// Get all payments (for admin reporting)
export async function getPayments() {
  // In a real app, this would query a database
  return [...paymentDatabase]
}

// Generate report (potentially long-running operation)
export async function generateReport(reportType: string) {
  // Simulate a long-running report generation process
  await new Promise((resolve) => setTimeout(resolve, 3000))

  // Calculate report data
  const totalPayments = paymentDatabase.length
  const totalAmount = paymentDatabase.reduce((sum, payment) => sum + payment.amount, 0)

  // Group by payment method
  const paymentsByMethod = paymentDatabase.reduce((acc: any, payment) => {
    acc[payment.method] = (acc[payment.method] || 0) + 1
    return acc
  }, {})

  return {
    reportType,
    generatedAt: new Date().toISOString(),
    totalPayments,
    totalAmount,
    paymentsByMethod,
  }
}
