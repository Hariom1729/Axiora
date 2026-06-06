import { FcGoogle } from "react-icons/fc"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"

import { GoogleLogin } from '@react-oauth/google'

import { loginWithOAuthToken } from "../../../services/operations/authAPI"

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
      <div className="flex justify-center w-full">
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            dispatch(loginWithOAuthToken(credentialResponse.credential, navigate));
          }}
          onError={() => {
            console.log('Login Failed');
          }}
          useOneTap
          theme="filled_black"
          shape="rectangular"
          size="large"
          text="continue_with"
        />
      </div>
    </div>
  )
}

export default LoginForm