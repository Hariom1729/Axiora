import { FcGoogle } from "react-icons/fc"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"

import { loginWithGoogle } from "../../../services/operations/authAPI"

function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <div className="mt-6 flex w-full flex-col gap-y-6">
      <div className="text-center text-richblack-200">
        <p className="text-sm">
          Access your courses, dashboard, and settings instantly using your Google account.
        </p>
      </div>

      {/* Google Sign-In Button */}
      <button
        type="button"
        onClick={() => dispatch(loginWithGoogle(navigate))}
        className="flex items-center justify-center gap-x-3 rounded-xl border border-richblack-700 bg-richblack-800/50 py-4 px-[12px] font-semibold text-richblack-5 hover:bg-richblack-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
      >
        <FcGoogle className="text-2xl" />
        <span>Continue with Google</span>
      </button>
    </div>
  )
}

export default LoginForm