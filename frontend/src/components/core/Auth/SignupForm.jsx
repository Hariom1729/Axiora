import { useState } from "react"
import { FcGoogle } from "react-icons/fc"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { GoogleLogin } from '@react-oauth/google'

import { loginWithOAuthToken } from "../../../services/operations/authAPI"
import { ACCOUNT_TYPE } from "../../../utils/constants"
import Tab from "../../common/Tab"



function SignupForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // student or instructor
  const [accountType, setAccountType] = useState(ACCOUNT_TYPE.STUDENT);

  // data to pass to Tab component
  const tabData = [
    {
      id: 1,
      tabName: "Student",
      type: ACCOUNT_TYPE.STUDENT,
    },
    {
      id: 2,
      tabName: "Instructor",
      type: ACCOUNT_TYPE.INSTRUCTOR,
    },
  ];



  return (
    <div className="flex w-full flex-col gap-y-6">
      {/* Tab */}
      <Tab tabData={tabData} field={accountType} setField={setAccountType} />

      <div className="text-center text-richblack-200">
        <p className="text-sm">
          Please select whether you want to join as a Student or Instructor, then sign up using your Google account.
        </p>
      </div>

      {/* Google Sign-Up Button */}
      <div className="flex justify-center w-full">
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            dispatch(loginWithOAuthToken(credentialResponse.credential, navigate, accountType));
          }}
          onError={() => {
            console.log('Signup Failed');
          }}
          useOneTap
          theme="filled_black"
          shape="rectangular"
          size="large"
          text="continue_with"
          width="100%"
        />
      </div>
    </div>
  )
}

export default SignupForm