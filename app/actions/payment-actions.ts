"use server"

import { revalidatePath } from "next/cache"
import { 
  PaymentProcessingException, 
  ValidationException, 
  ConcurrencyException,
  ExceptionHandler,
  ValidationUtils
} from "@/lib/exceptions"

// Simulating a database with concurrent access
const processingPayments = new Set()
const paymentDatabase: any[] = []

// Atomic counter for payment IDs
let paymentIdCounter = 0

// Function to get a unique payment ID atomically
function getNextPaymentId() {
  return `PAY${Date.now()}-${paymentIdCounter++}`
}

// Process payment with enhanced exception handling
export async function processPayment(formData: FormData) {
  const studentId = formData.get("studentId") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const method = formData.get("method") as string

  try {
    // Validate input data
    ValidationUtils.validateStudentId(studentId)
    ValidationUtils.validatePaymentAmount(amount)

    if (!method || method.trim().length === 0) {
      throw new ValidationException("Payment method is required", "method")
    }

    // Check if this payment is already being processed (prevent double submission)
    const paymentKey = `${studentId}-${amount}-${Date.now()}`
    if (processingPayments.has(paymentKey)) {
      throw new ConcurrencyException("Payment is already being processed")
    }

    // Mark this payment as being processed
    processingPayments.add(paymentKey)

    // Simulate payment gateway processing (async operation)
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate random payment failures (10% chance)
        if (Math.random() < 0.1) {
          reject(new PaymentProcessingException("Payment gateway declined the transaction"))
        } else {
          resolve(undefined)
        }
      }, 2000)
    })

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
    const handled = ExceptionHandler.handle(error)
    ExceptionHandler.log(error)
    
    return {
      success: false,
      message: handled.message,
      code: handled.code,
    }
  } finally {
    // Always remove from processing set
    const paymentKey = `${studentId}-${amount}-${Date.now()}`
    processingPayments.delete(paymentKey)
  }
}

// Get all payments (for admin reporting)
export async function getPayments() {
  try {
    // In a real app, this would query a database
    return [...paymentDatabase]
  } catch (error) {
    ExceptionHandler.log(error)
    throw new PaymentProcessingException("Failed to retrieve payments")
  }
}

// Generate report (potentially long-running operation)
export async function generateReport(reportType: string) {
  try {
    if (!reportType || reportType.trim().length === 0) {
      throw new ValidationException("Report type is required", "reportType")
    }

    // Simulate a long-running report generation process
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate random report generation failures (5% chance)
        if (Math.random() < 0.05) {
          reject(new PaymentProcessingException("Report generation failed due to system overload"))
        } else {
          resolve(undefined)
        }
      }, 3000)
    })

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
  } catch (error) {
    ExceptionHandler.log(error)
    throw error
  }
}