import React, { useState, useEffect } from 'react'
import { X, Check, Github, Mail, User, Lock, Chrome, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { signUp as betterSignUp, signIn as betterSignIn } from '#/lib/auth-client'

export function AuthModal({ isOpen, onClose, initialMode = 'login', redirectTo }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  
  const [validation, setValidation] = useState<ValidationRules>({
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false
  })

  const navigate = useNavigate()

  useEffect(() => {
    setValidation({
      minLength: password.length >= 6,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password)
    })
  }, [password])

  const isPasswordValid = validation.minLength && validation.hasUpper && validation.hasLower && validation.hasNumber

  if (!isOpen) return null

  const handleSocialLogin = async (provider: 'github' | 'google') => {
    setIsLoading(true)
    try {
      await betterSignIn.social({
        provider,
        callbackURL: redirectTo || '/workspace'
      })
    } catch (err: any) {
      toast.error('Failed to initiate login.')
      setIsLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (mode === 'signup' && !isPasswordValid) {
      toast.error('Please meet all password requirements')
      return
    }

    setIsLoading(true)

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          toast.error('Passwords do not match')
          setIsLoading(false)
          return
        }
        
        const { data, error } = await betterSignUp.email({
          email,
          password,
          name,
          callbackURL: redirectTo || '/workspace'
        })

        if (error) {
          toast.error(error.message || 'Signup failed')
        } else {
          toast.success('Account created successfully!')
          onClose()
          navigate({ to: (redirectTo ?? '/workspace') as any })
        }
      } else {
        const { data, error } = await betterSignIn.email({
          email,
          password,
          callbackURL: redirectTo || '/workspace'
        })

        if (error) {
          toast.error(error.message || 'Login failed')
        } else {
          toast.success('Logged in successfully!')
          onClose()
          navigate({ to: (redirectTo ?? '/workspace') as any })
        }
      }
    } catch (err: any) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const ValidationItem = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-xs transition-colors ${met ? 'text-green-500' : 'text-secondaryText'}`}>
      {met ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
      <span>{text}</span>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[90vw] lg:max-w-[1000px] bg-bgDarkTransparentLighter border border-mainBorderDarker rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl animate-in fade-in duration-300 zoom-in">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-secondaryText hover:text-white transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex flex-col lg:flex-row min-h-[500px]">
          
          {/* Left Side (Marketing) - Hidden on Mobile */}
          <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center bg-gradient-to-br from-primaryColor/10 to-transparent border-r border-mainBorderFaintest">
            <h2 className="text-primaryText text-4xl xl:text-5xl font-bold mb-2 tracking-tight leading-tight">
              {mode === 'login' ? 'Welcome Back' : 'Start Creating'}
            </h2>
            <h2 className="text-primaryColor text-4xl xl:text-5xl font-bold mb-8 tracking-tight">
              {mode === 'login' ? 'AI is waiting' : 'The future is here'}
            </h2>
            
            <ul className="space-y-6">
              {[
                'Generate presentations in seconds',
                'AI-powered content suggestions',
                'Export to PPTX and PDF instantly'
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-4 text-primaryText/80">
                  <div className="h-6 w-6 rounded-full bg-primaryColor/20 flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4 text-primaryColor" />
                  </div>
                  <span className="text-lg">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Side (Auth Form) */}
          <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center max-w-md mx-auto w-full lg:max-w-none">
            
            {/* Header */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-primaryText mb-2">
                {mode === 'login' ? (
                  <>Sign in to SlideFlow</>
                ) : (
                  'Create your account'
                )}
              </h3>
              <p className="text-secondaryText text-sm">
                {mode === 'login' ? 'Join 3,953 other creators' : 'Join our community of creators'}
              </p>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button 
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="flex items-center justify-center gap-3 py-3 px-4 bg-bgDark3 hover:bg-bgDark3Hover border border-mainBorderDarker rounded-xl transition-all disabled:opacity-50"
              >
                <Chrome className="h-5 w-5 text-primaryColor" />
                <span className="text-sm font-medium text-primaryText">Google</span>
              </button>
              <button 
                onClick={() => handleSocialLogin('github')}
                disabled={isLoading}
                className="flex items-center justify-center gap-3 py-3 px-4 bg-bgDark3 hover:bg-bgDark3Hover border border-mainBorderDarker rounded-xl transition-all disabled:opacity-50"
              >
                <Github className="h-5 w-5 text-primaryText" />
                <span className="text-sm font-medium text-primaryText">GitHub</span>
              </button>
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-mainBorderFaintest"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-bgDarkTransparentLighter px-4 text-secondaryText">Or continue with email</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === 'signup' && (
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="form-input pl-4 pr-12 py-3.5"
                  />
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondaryText" />
                </div>
              )}
              
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input pl-4 pr-12 py-3.5"
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondaryText" />
              </div>

              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordTouched(true)
                  }}
                  required
                  className={`form-input pl-4 pr-12 py-3.5 ${mode === 'signup' && passwordTouched && !isPasswordValid ? 'border-red-500/50 focus:border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondaryText hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Real-time Validation UI (Only for signup) */}
              {mode === 'signup' && (passwordTouched || password.length > 0) && (
                <div className="grid grid-cols-2 gap-2 px-1 py-1">
                  <ValidationItem met={validation.minLength} text="Min 6 characters" />
                  <ValidationItem met={validation.hasUpper} text="Uppercase letter" />
                  <ValidationItem met={validation.hasLower} text="Lowercase letter" />
                  <ValidationItem met={validation.hasNumber} text="At least one digit" />
                </div>
              )}

              {mode === 'signup' && (
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`form-input pl-4 pr-12 py-3.5 ${confirmPassword && password !== confirmPassword ? 'border-red-500/50 focus:border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secondaryText hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading || (mode === 'signup' && !isPasswordValid)}
                className="w-full py-4 bg-primaryColor hover:bg-primaryColor/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-primaryColor/20 disabled:opacity-50 disabled:grayscale mt-4"
              >
                {isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            {/* Footer Toggle */}
            <p className="mt-8 text-center text-secondaryText text-sm">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login')
                  setPasswordTouched(false)
                }}
                className="text-primaryColor font-semibold hover:underline"
              >
                {mode === 'login' ? 'Sign up now' : 'Sign in here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

