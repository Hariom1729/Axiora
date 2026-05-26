import { toast } from "react-hot-toast"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  EmailAuthProvider,
  linkWithCredential,
} from "firebase/auth"

import { auth, googleProvider } from "../../firebase"
import { setLoading, setToken } from "../../slices/authSlice"
import { resetCart } from "../../slices/cartSlice"
import { setUser } from "../../slices/profileSlice"
import { apiConnector } from "../apiConnector"
import { endpoints } from "../apis"

const { FIREBASE_LOGIN_API } = endpoints


// ================ Send SMS OTP ================
export function sendSmsOtp(contactNumber, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Sending OTP...")
    dispatch(setLoading(true))
    let dynamicContainer = null
    try {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear()
          window.recaptchaVerifier = null
        } catch (e) {
          console.error("Error clearing existing recaptcha:", e)
        }
      }

      const oldContainer = document.getElementById('recaptcha-container-dynamic')
      if (oldContainer) {
        try {
          oldContainer.remove()
        } catch (e) {}
      }

      // Create a fresh dynamic container in the DOM
      dynamicContainer = document.createElement('div')
      dynamicContainer.id = 'recaptcha-container-dynamic'
      document.body.appendChild(dynamicContainer)

      window.recaptchaVerifier = new RecaptchaVerifier(auth, dynamicContainer, {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved, proceed with phone auth
        }
      });

      const confirmationResult = await signInWithPhoneNumber(auth, contactNumber, window.recaptchaVerifier)
      window.confirmationResult = confirmationResult

      toast.success("OTP Sent Successfully")
      navigate("/verify-email")
    } catch (error) {
      console.log("SEND SMS OTP ERROR............", error)
      let friendlyMessage = error?.message || "Could Not Send OTP"
      if (error?.code === "auth/billing-not-enabled") {
        friendlyMessage = "Firebase Phone Auth requires a Billing (Blaze) Plan. For testing, please register a Test Phone Number in your Firebase Console."
      }
      toast.error(friendlyMessage, { duration: 6000 })
      
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear()
          window.recaptchaVerifier = null
        } catch (e) {
          console.error(e)
        }
      }
      if (dynamicContainer) {
        try {
          dynamicContainer.remove()
        } catch (e) {}
      }
    }
    dispatch(setLoading(false))
    toast.dismiss(toastId)
  }
}

// ================ Sign Up with SMS Phone Auth & Email Link ================
export function signUpWithSms(firstName, lastName, email, password, contactNumber, accountType, otp, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Creating your account...")
    dispatch(setLoading(true))

    try {
      if (!window.confirmationResult) {
        throw new Error("No verification session found. Please try signing up again.")
      }

      // 1. Verify SMS OTP
      const userCredential = await window.confirmationResult.confirm(otp)

      // 2. Link Email & Password to the newly verified Phone User
      const emailCred = EmailAuthProvider.credential(email, password)
      await linkWithCredential(userCredential.user, emailCred)

      // 3. Get Firebase ID token (force refresh to include newly linked email provider)
      const idToken = await userCredential.user.getIdToken(true)

      // 4. Sync with backend — create MongoDB user
      const response = await apiConnector("POST", FIREBASE_LOGIN_API, {
        firstName,
        lastName,
        email,
        accountType,
        contactNumber,
      }, {
        Authorization: `Bearer ${idToken}`,
      })

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      // 5. Store token and user in Redux + localStorage
      dispatch(setToken(idToken))

      const userImage = response.data?.user?.image
        ? response.data.user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`

      dispatch(setUser({ ...response.data.user, image: userImage }))
      localStorage.setItem("token", JSON.stringify(idToken))
      localStorage.setItem("user", JSON.stringify({ ...response.data.user, image: userImage }))

      toast.success("Account created successfully!")
      navigate("/dashboard/my-profile")
    } catch (error) {
      console.log("SIGNUP ERROR --> ", error)
      let msg = error?.message || "Signup failed"
      if (error?.code === "auth/email-already-in-use") {
        msg = "This email is already registered. Please log in."
      } else if (error?.code === "auth/weak-password") {
        msg = "Password should be at least 6 characters."
      } else if (error?.code === "auth/invalid-verification-code") {
        msg = "Invalid OTP. Please check the code and try again."
      } else if (error?.code === "auth/credential-already-in-use") {
        msg = "This email or phone number is already linked to another account."
      }
      toast.error(msg)
    }

    dispatch(setLoading(false))
    toast.dismiss(toastId)
  }
}


// ================ Login with Email & Password ================
export function loginWithEmail(email, password, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Signing you in...")
    dispatch(setLoading(true))

    try {
      // 1. Sign in with Firebase
      const result = await signInWithEmailAndPassword(auth, email, password)

      // 2. Get Firebase ID token
      const idToken = await result.user.getIdToken()

      // 3. Sync with backend
      const response = await apiConnector("POST", FIREBASE_LOGIN_API, null, {
        Authorization: `Bearer ${idToken}`,
      })

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      // 4. Store token and user in Redux + localStorage
      dispatch(setToken(idToken))

      const userImage = response.data?.user?.image
        ? response.data.user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`

      dispatch(setUser({ ...response.data.user, image: userImage }))
      localStorage.setItem("token", JSON.stringify(idToken))
      localStorage.setItem("user", JSON.stringify({ ...response.data.user, image: userImage }))

      toast.success("Login Successful")
      navigate("/dashboard/my-profile")
    } catch (error) {
      console.log("LOGIN ERROR --> ", error)
      const msg = error?.code === "auth/user-not-found"
        ? "No account found with this email."
        : error?.code === "auth/wrong-password"
        ? "Incorrect password."
        : error?.code === "auth/invalid-credential"
        ? "Invalid email or password."
        : error?.code === "auth/too-many-requests"
        ? "Too many failed attempts. Please try again later."
        : error?.message || "Login failed"
      toast.error(msg)
    }

    dispatch(setLoading(false))
    toast.dismiss(toastId)
  }
}


// ================ Login / Sign Up with Google ================
export function loginWithGoogle(navigate, accountType) {
  return async (dispatch) => {
    const toastId = toast.loading("Signing in with Google...")
    dispatch(setLoading(true))

    try {
      // 1. Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider)

      // 2. Get Firebase ID token
      const idToken = await result.user.getIdToken()

      // 3. Sync with backend (backend will create user if first time)
      const response = await apiConnector("POST", FIREBASE_LOGIN_API, {
        accountType: accountType || localStorage.getItem("pendingAccountType") || "Student",
      }, {
        Authorization: `Bearer ${idToken}`,
      })

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      // 4. Store token and user in Redux + localStorage
      dispatch(setToken(idToken))

      const userImage = response.data?.user?.image
        ? response.data.user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`

      dispatch(setUser({ ...response.data.user, image: userImage }))
      localStorage.setItem("token", JSON.stringify(idToken))
      localStorage.setItem("user", JSON.stringify({ ...response.data.user, image: userImage }))

      toast.success("Login Successful")
      navigate("/dashboard/my-profile")
    } catch (error) {
      console.log("GOOGLE LOGIN ERROR --> ", error)
      if (error?.code === "auth/popup-closed-by-user") {
        toast.error("Sign-in cancelled")
      } else {
        toast.error(error?.message || "Google sign-in failed")
      }
    }

    dispatch(setLoading(false))
    toast.dismiss(toastId)
  }
}


// ================ Forgot Password ================
export function forgotPassword(email, setEmailSent) {
  return async (dispatch) => {
    const toastId = toast.loading("Sending reset email...")
    dispatch(setLoading(true))

    try {
      await sendPasswordResetEmail(auth, email)
      toast.success("Password reset email sent!")
      setEmailSent(true)
    } catch (error) {
      console.log("FORGOT PASSWORD ERROR --> ", error)
      const msg = error?.code === "auth/user-not-found"
        ? "No account found with this email."
        : error?.message || "Failed to send reset email"
      toast.error(msg)
    }

    toast.dismiss(toastId)
    dispatch(setLoading(false))
  }
}


// ================ Logout ================
export function logout(navigate) {
  return async (dispatch) => {
    try {
      await signOut(auth)
    } catch (error) {
      console.log("SIGNOUT ERROR --> ", error)
    }
    dispatch(setToken(null))
    dispatch(setUser(null))
    dispatch(resetCart())
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    toast.success("Logged Out")
    navigate("/")
  }
}