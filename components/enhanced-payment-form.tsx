"use client"

import { useState, useTransition } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { CreditCard, Loader2, Shield, Lock, CheckCircle } from "lucide-react"
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
import { slideUp, slideInLeft, slideInRight, scaleIn, fadeIn } from "@/lib/animation-utils"
import { ValidationUtils } from "@/lib/exceptions"

// Enhanced form schema with better validation
const formSchema = z.object({
  cardName: z.string().min(2, { message: "Name is required" }),
  cardNumber: z.string().refine((val) => {
    try {
      ValidationUtils.validateCardNumber(val)
      return true
    } catch {
      return false
    }
  }, { message: "Card number must be 16 digits" }),
  expiryMonth: z.string().min(1, { message: "Required" }),
  expiryYear: z.string().min(1, { message: "Required" }),
  cvv: z.string().refine((val) => {
    try {
      ValidationUtils.validateCVV(val)
      return true
    } catch {
      return false
    }
  }, { message: "CVV must be 3-4 digits" }),
  paymentMethod: z.enum(["credit", "bank", "other"], { required_error: "Please select a payment method" }),
})

// Enhanced payment form with impressive animations and better UX
export function EnhancedPaymentForm({
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
  const [processingStep, setProcessingStep] = useState(0)
  const { toast } = useToast()

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

  // Enhanced form submission with step-by-step processing
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData()
    formData.append("studentId", payment.studentId || "STU001")
    formData.append("amount", payment.amount.toString())
    formData.append("method", values.paymentMethod)

    startTransition(async () => {
      try {
        setProcessingStep(1) // Validating
        await new Promise(resolve => setTimeout(resolve, 800))
        
        setProcessingStep(2) // Processing
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setProcessingStep(3) // Confirming
        const result = await processPayment(formData)

        if (result.success) {
          setProcessingStep(4) // Success
          await new Promise(resolve => setTimeout(resolve, 500))
          
          setIsComplete(true)
          toast({
            title: "Payment Successful",
            description: `Payment ID: ${result.paymentId}`,
          })

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
      } finally {
        setProcessingStep(0)
      }
    })
  }

  // Processing steps animation
  const processingSteps = [
    { step: 1, label: "Validating payment details...", icon: Shield },
    { step: 2, label: "Processing payment...", icon: CreditCard },
    { step: 3, label: "Confirming transaction...", icon: Lock },
    { step: 4, label: "Payment successful!", icon: CheckCircle },
  ]

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

  // Processing overlay
  if (isPending) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <motion.div
          className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-10 w-10 text-primary" />
        </motion.div>
        
        <AnimatePresence mode="wait">
          {processingSteps.map((step) => (
            processingStep === step.step && (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center gap-3"
              >
                <step.icon className="h-5 w-5 text-primary" />
                <span className="text-lg font-medium">{step.label}</span>
              </motion.div>
            )
          ))}
        </AnimatePresence>
        
        <motion.div
          className="mt-8 h-2 w-64 overflow-hidden rounded-full bg-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${(processingStep / 4) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>
      </motion.div>
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
                <FormLabel className="text-lg font-semibold">Payment Method</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                  >
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                        <FormControl>
                          <RadioGroupItem value="credit" />
                        </FormControl>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <FormLabel className="font-normal cursor-pointer">Credit/Debit Card</FormLabel>
                        </div>
                      </FormItem>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                        <FormControl>
                          <RadioGroupItem value="bank" />
                        </FormControl>
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          <FormLabel className="font-normal cursor-pointer">Bank Transfer</FormLabel>
                        </div>
                      </FormItem>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                        <FormControl>
                          <RadioGroupItem value="other" />
                        </FormControl>
                        <div className="flex items-center gap-2">
                          <Lock className="h-5 w-5 text-primary" />
                          <FormLabel className="font-normal cursor-pointer">Other Methods</FormLabel>
                        </div>
                      </FormItem>
                    </motion.div>
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
              variants={fadeIn}
              className="space-y-6"
            >
              <motion.div
                className="rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 p-6"
                variants={scaleIn}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-medium text-primary">Secure Payment</span>
                </div>
                
                <div className="grid gap-4">
                  <motion.div variants={slideInLeft}>
                    <FormField
                      control={form.control}
                      name="cardName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name on Card</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
                              {...field} 
                              className="transition-all focus:ring-2 focus:ring-primary/20"
                            />
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
                              <Input 
                                placeholder="1234 5678 9012 3456" 
                                {...field}
                                maxLength={19}
                                onChange={(e) => {
                                  // Format card number with spaces
                                  const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
                                  field.onChange(value.replace(/\s/g, ''))
                                  e.target.value = value
                                }}
                                className="transition-all focus:ring-2 focus:ring-primary/20"
                              />
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
                          <FormLabel>Month</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
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
                          <FormLabel>Year</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
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
                            <Input 
                              placeholder="123" 
                              maxLength={4}
                              {...field}
                              className="transition-all focus:ring-2 focus:ring-primary/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                </div>
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
              className="rounded-lg border bg-muted/50 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-primary">Bank Transfer Instructions</h3>
              </div>
              
              <p className="mb-4 text-sm text-muted-foreground">
                Please transfer ${payment.amount} to the following account:
              </p>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="space-y-3 text-sm"
              >
                <div className="flex justify-between p-2 rounded bg-background">
                  <span className="font-medium">Bank Name:</span>
                  <span>School National Bank</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-background">
                  <span className="font-medium">Account Name:</span>
                  <span>School Fee Account</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-background">
                  <span className="font-medium">Account Number:</span>
                  <span className="font-mono">1234567890</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-background">
                  <span className="font-medium">Reference:</span>
                  <span className="font-mono">FEE-{payment.id}</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-between pt-4"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              type="submit" 
              disabled={isPending} 
              className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {isPending ? (
                <>
                  <motion.div
                    className="absolute inset-0 bg-white/20"
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
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Pay ${payment.amount}
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </form>
    </Form>
  )
}