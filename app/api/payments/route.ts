import { type NextRequest, NextResponse } from "next/server"

// Simulating a database with a Map
// In a real application, you would use a proper database with transaction support
const paymentDatabase = new Map()
const paymentLocks = new Map()

// Mutex implementation for locking resources
class Mutex {
  private locked = false
  private waitingQueue: Array<(value: unknown) => void> = []

  async acquire(): Promise<void> {
    if (!this.locked) {
      this.locked = true
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      this.waitingQueue.push(resolve)
    })
  }

  release(): void {
    if (this.waitingQueue.length > 0) {
      const nextResolve = this.waitingQueue.shift()
      if (nextResolve) nextResolve(undefined)
    } else {
      this.locked = false
    }
  }
}

// Process payment with concurrency control
async function processPayment(paymentData: any) {
  const { studentId, amount } = paymentData

  // Get or create a lock for this student
  if (!paymentLocks.has(studentId)) {
    paymentLocks.set(studentId, new Mutex())
  }

  const lock = paymentLocks.get(studentId)

  try {
    // Acquire lock to prevent concurrent modifications for the same student
    await lock.acquire()

    // Simulate database read
    const existingPayments = paymentDatabase.get(studentId) || []

    // Check for duplicate payments (within last 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    const recentDuplicate = existingPayments.find((p: any) => p.amount === amount && p.timestamp > fiveMinutesAgo)

    if (recentDuplicate) {
      return { success: false, error: "Duplicate payment detected" }
    }

    // Simulate payment processing delay (external payment gateway)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Create payment record with unique ID
    const paymentId = `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`
    const payment = {
      id: paymentId,
      ...paymentData,
      timestamp: Date.now(),
      status: "completed",
    }

    // Update database atomically
    paymentDatabase.set(studentId, [...existingPayments, payment])

    // Return success
    return {
      success: true,
      paymentId,
      message: "Payment processed successfully",
    }
  } catch (error) {
    console.error("Payment processing error:", error)
    return {
      success: false,
      error: "Payment processing failed",
    }
  } finally {
    // Always release the lock
    lock.release()
  }
}

// API route handler for payments
export async function POST(request: NextRequest) {
  try {
    const paymentData = await request.json()

    // Validate payment data
    if (!paymentData.studentId || !paymentData.amount) {
      return NextResponse.json({ success: false, error: "Invalid payment data" }, { status: 400 })
    }

    // Process payment with concurrency control
    const result = await processPayment(paymentData)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Payment API error:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

// Get all payments (for admin reporting)
export async function GET() {
  try {
    // Convert Map to array of objects for response
    const payments = Array.from(paymentDatabase.entries()).map(([studentId, payments]) => ({
      studentId,
      payments,
    }))

    return NextResponse.json({ payments })
  } catch (error) {
    console.error("Get payments error:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
