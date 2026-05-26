import { useState } from "react"
import { FcGoogle } from "react-icons/fc"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"

import { loginWithGoogle } from "../../../services/operations/authAPI"
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

  const handleGoogleSignup = () => {
    localStorage.setItem("pendingAccountType", accountType);
    dispatch(loginWithGoogle(navigate, accountType));
  };

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
      <button
        type="button"
        onClick={handleGoogleSignup}
        className="flex items-center justify-center gap-x-3 rounded-xl border border-richblack-700 bg-richblack-800/50 py-4 px-[12px] font-semibold text-richblack-5 hover:bg-richblack-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
      >
        <FcGoogle className="text-2xl" />
        <span>Continue with Google</span>
      </button>
    </div>
  )
}

export default SignupForm