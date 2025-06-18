"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { AuthenticationException, ExceptionHandler } from "@/lib/exceptions"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "parent"
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: "admin" | "parent") => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        ExceptionHandler.log(error)
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Demo authentication logic
      if (email === "admin@example.com") {
        const adminUser: User = {
          id: "1",
          name: "Admin User",
          email: "admin@example.com",
          role: "admin"
        }
        setUser(adminUser)
        localStorage.setItem("user", JSON.stringify(adminUser))
      } else if (email === "parent@example.com") {
        const parentUser: User = {
          id: "2",
          name: "Parent User",
          email: "parent@example.com",
          role: "parent"
        }
        setUser(parentUser)
        localStorage.setItem("user", JSON.stringify(parentUser))
      } else {
        throw new AuthenticationException("Invalid credentials")
      }
    } catch (error) {
      ExceptionHandler.log(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, role: "admin" | "parent") => {
    try {
      setIsLoading(true)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        role
      }
      
      setUser(newUser)
      localStorage.setItem("user", JSON.stringify(newUser))
    } catch (error) {
      ExceptionHandler.log(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setUser(null)
      localStorage.removeItem("user")
    } catch (error) {
      ExceptionHandler.log(error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}