import { AuthForm } from '@/components/auth/AuthForm'
import { registerAction } from '@/app/actions'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070707] p-4 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black">
      <AuthForm type="register" onSubmit={registerAction} />
    </div>
  )
}
