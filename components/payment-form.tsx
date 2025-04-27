"use client"

import { useState, useTransition } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { CreditCard, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { processPayment } from "@/app/actions/payment-actions"
import { useToast } from "@/hooks/use-toast"
import { AnimatedSuccess } from "@/components/animated-success"
import { AnimatedError } from "@/components/animated-error"
import { slideUp, slideInLeft, slideInRight } from "@/lib/animation-utils"

// Form schema using zod for validation
const formSchema = z.object({
  cardName: z.string().min(2, { message: "Name is required" }),
  cardNumber: z.string().min(16, { message: "Card number must be 16 digits" }).max(16),
  expiryMonth: z.string().min(1, { message: "Required" }),
  expiryYear: z.string().min(1, { message: "Required" }),
  cvv: z.string().min(3, { message: "CVV must be 3 digits" }).max(3),
  paymentMethod: z.enum(["credit", "bank", "other"], { required_error: "Please select a payment method" }),
})

// Payment form component with concurrency handling and animations
export function PaymentForm({
  payment,
  onCancel,
  onSuccess,
}: {
  payment: any
  onCancel: () => void
  onSuccess: () => void
}) {
  const [isComplete, setIsComplete] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  // Form definition using react-hook-form with zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardName: "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      paymentMethod: "credit",
    },
  })

  // Handle form submission with optimistic UI updates
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Create form data for server action
    const formData = new FormData()
    formData.append("studentId", payment.studentId || "STU001")
    formData.append("amount", payment.amount.toString())
    formData.append("method", values.paymentMethod)

    // Use React transitions for concurrent mode
    startTransition(async () => {
      try {
        // Process payment using server action
        const result = await processPayment(formData)

        if (result.success) {
          setIsComplete(true)
          toast({
            title: "Payment Successful",
            description: `Payment ID: ${result.paymentId}`,
          })

          // Simulate redirect after payment completion
          setTimeout(() => {
            onSuccess()
          }, 3000)
        } else {
          setIsError(true)
          setErrorMessage(result.message || "Payment failed")
          toast({
            title: "Payment Failed",
            description: result.message,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Payment error:", error)
        setIsError(true)
        setErrorMessage("An unexpected error occurred")
        toast({
          title: "Payment Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      }
    })
  }

  if (isComplete) {
    return (
      <AnimatedSuccess
        message="Payment Successful!"
        subMessage={`Your payment of $${payment.amount} has been processed successfully.`}
        onComplete={onSuccess}
        duration={3000}
      />
    )
  }

  if (isError) {
    return (
      <AnimatedError
        message="Payment Failed"
        subMessage={errorMessage}
        onComplete={() => setIsError(false)}
        duration={3000}
      />
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <motion.div initial="hidden" animate="visible" variants={slideUp}>
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Payment Method</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="credit" />
                      </FormControl>
                      <FormLabel className="font-normal">Credit/Debit Card</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="bank" />
                      </FormControl>
                      <FormLabel className="font-normal">Bank Transfer</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="other" />
                      </FormControl>
                      <FormLabel className="font-normal">Other Payment Methods</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <AnimatePresence>
          {form.watch("paymentMethod") === "credit" && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, height: 0 }}
              variants={slideUp}
              className="space-y-4"
            >
              <motion.div variants={slideInLeft}>
                <FormField
                  control={form.control}
                  name="cardName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name on Card</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
              <motion.div variants={slideInRight}>
                <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder="1234 5678 9012 3456" {...field} />
                          <CreditCard className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
              <motion.div variants={slideInLeft} className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="expiryMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Month</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => {
                            const month = i + 1
                            return (
                              <SelectItem key={month} value={month.toString().padStart(2, "0")}>
                                {month.toString().padStart(2, "0")}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiryYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Year</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="YY" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => {
                            const year = new Date().getFullYear() + i
                            return (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input placeholder="123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {form.watch("paymentMethod") === "bank" && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, height: 0 }}
              variants={slideUp}
              className="rounded-lg border p-4"
            >
              <h3 className="font-medium">Bank Transfer Instructions</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Please transfer ${payment.amount} to the following account:
              </p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-4 space-y-2 text-sm"
              >
                <div className="flex justify-between">
                  <span className="font-medium">Bank Name:</span>
                  <span>School National Bank</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Account Name:</span>
                  <span>School Fee Account</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Account Number:</span>
                  <span>1234567890</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Reference:</span>
                  <span>FEE-{payment.id}</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-between"
        >
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="relative overflow-hidden">
            {isPending ? (
              <>
                <motion.div
                  className="absolute inset-0 bg-primary/20"
                  animate={{
                    x: ["0%", "100%"],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                />
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay $${payment.amount}`
            )}
          </Button>
        </motion.div>
      </form>
    </Form>
  )
}
