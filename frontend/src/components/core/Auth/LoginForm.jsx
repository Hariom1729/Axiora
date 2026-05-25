import { useState } from "react"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"

import { login } from "../../../services/operations/authAPI"

function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false)

  const { email, password } = formData;

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }))
  }

  const handleOnSubmit = (e) => {
    e.preventDefault();
    dispatch(login(email, password, navigate))
  }

  return (
    <form
      onSubmit={handleOnSubmit}
      className="mt-6 flex w-full flex-col gap-y-4"
    >
      <label className="w-full">
        <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5 font-medium">
          Email Address <sup className="text-pink-200">*</sup>
        </p>
        <input
          required
          type="text"
          name="email"
          value={email}
          onChange={handleOnChange}
          placeholder="Enter email address"
          className="w-full rounded-xl bg-richblack-800/50 p-[12px] text-richblack-5 outline-none border border-richblack-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
        />
      </label>

      <label className="relative">
        <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5 font-medium">
          Password <sup className="text-pink-200">*</sup>
        </p>
        <input
          required
          type={showPassword ? "text" : "password"}
          name="password"
          value={password}
          onChange={handleOnChange}
          placeholder="Enter Password"
          className="w-full rounded-xl bg-richblack-800/50 p-[12px] pr-12 text-richblack-5 outline-none border border-richblack-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
        />
        <span
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-[38px] z-[10] cursor-pointer hover:scale-110 transition-transform"
        >
          {showPassword ? (
            <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
          ) : (
            <AiOutlineEye fontSize={24} fill="#AFB2BF" />
          )}
        </span>
        <Link to="/forgot-password">
          <p className="mt-2 ml-auto max-w-max text-xs text-blue-300 hover:text-blue-100 transition-colors">
            Forgot Password?
          </p>
        </Link>
      </label>


      <button
        type="submit"
        className="mt-6 rounded-xl bg-yellow-50 hover:bg-yellow-100 py-3 px-[12px] font-semibold text-richblack-900 shadow-[0_0_20px_rgba(255,214,10,0.3)] hover:shadow-[0_0_30px_rgba(255,214,10,0.5)] transition-all duration-300 transform hover:-translate-y-1"
      >
        Sign In
      </button>
    </form>
  )
}

export default LoginForm