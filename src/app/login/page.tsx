import { AuthForm } from '@/components/auth/AuthForm'
import { loginAction } from '@/app/actions'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070707] p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black">
      <AuthForm type="login" onSubmit={loginAction} />
    </div>
  )
}
