import { AuthForm } from '@/components/auth/AuthForm'
import { loginAction } from '@/app/actions'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020202] p-4 bg-[radial-gradient(circle_at_top,_#0a0a0a_0%,_#020202_60%)]">
      <AuthForm type="login" onSubmit={loginAction} />
    </div>
  )
}
