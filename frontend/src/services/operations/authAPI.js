import { toast } from "react-hot-toast"
import { setLoading, setToken } from "../../slices/authSlice"
import { resetCart } from "../../slices/cartSlice"
import { setUser } from "../../slices/profileSlice"
import { apiConnector } from "../apiConnector"
import { endpoints } from "../apis"

const { OAUTH_LOGIN_API } = endpoints

export function loginWithOAuthToken(token, navigate, accountType) {
  return async (dispatch) => {
    const toastId = toast.loading("Authenticating with Google...")
    dispatch(setLoading(true))

    try {
      const response = await apiConnector("POST", OAUTH_LOGIN_API, {
        accountType: accountType || localStorage.getItem("pendingAccountType") || "Student",
      }, {
        Authorization: `Bearer ${token}`,
      })

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      dispatch(setToken(token))

      const userImage = response.data?.user?.image
        ? response.data.user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`

      dispatch(setUser({ ...response.data.user, image: userImage }))
      localStorage.setItem("token", JSON.stringify(token))
      localStorage.setItem("user", JSON.stringify({ ...response.data.user, image: userImage }))

      toast.success("Login Successful")
      navigate("/dashboard/my-profile")
    } catch (error) {
      console.log("OAUTH LOGIN ERROR --> ", error)
      toast.error(error?.message || "Google sign-in failed")
    }

    dispatch(setLoading(false))
    toast.dismiss(toastId)
  }
}

export function logout(navigate) {
  return async (dispatch) => {
    dispatch(setToken(null))
    dispatch(setUser(null))
    dispatch(resetCart())
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    toast.success("Logged Out")
    navigate("/")
  }
}