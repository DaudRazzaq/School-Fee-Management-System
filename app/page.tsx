import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-primary py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">SchoolPay</h1>
            <div className="flex gap-4">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="text-white border-white hover:bg-white hover:text-primary font-medium transition-all duration-300 transform hover:scale-105"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary">Register</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/20 to-background py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Simplify School Fee Management</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              A comprehensive solution for educational institutions to manage fee collection, tracking, and reporting.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/register">
                <Button size="lg">Get Started</Button>
              </Link>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Easy Fee Submission</CardTitle>
                  <CardDescription>Multiple payment options available</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Submit fees using credit cards, bank transfers, and other payment methods with ease.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Automated Receipts</CardTitle>
                  <CardDescription>Instant confirmation</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Receive digital receipts immediately after payment confirmation.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Comprehensive Dashboard</CardTitle>
                  <CardDescription>Track all payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Monitor fee status, payment history, and upcoming dues from a single dashboard.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">© 2025 SchoolPay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
