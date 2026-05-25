import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiConnector";
import rzpLogo from "../../assets/Logo/rzp_logo.png"
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";


const { COURSE_PAYMENT_API, COURSE_VERIFY_API, SEND_PAYMENT_SUCCESS_EMAIL_API } = studentEndpoints;

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadScript(src) {
    return new Promise((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

function getErrorMessage(error) {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.messgae ||
        error?.message ||
        "Could not start payment"
    );
}

// ================ buyCourse ================ 
export async function buyCourse(token, coursesId, userDetails, navigate, dispatch) {
    const toastId = toast.loading("Loading...");

    try {
        if (!token) {
            toast.error("Please log in as a student to purchase.");
            return;
        }

        const RAZORPAY_KEY = import.meta.env.VITE_APP_RAZORPAY_KEY;
        if (!RAZORPAY_KEY) {
            toast.error("Razorpay Key ID missing. Add VITE_APP_RAZORPAY_KEY to frontend/.env and restart.");
            return;
        }

        const scriptLoaded = await loadScript(RAZORPAY_SCRIPT);
        if (!scriptLoaded || !window.Razorpay) {
            toast.error("Razorpay checkout failed to load. Check your internet connection.");
            return;
        }

        const orderResponse = await apiConnector("POST", COURSE_PAYMENT_API,
            { coursesId },
            {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            })

        if (!orderResponse?.data?.success) {
            const msg = orderResponse?.data?.message || "Could not create payment order";
            if (msg.toLowerCase().includes("authentication failed")) {
                throw new Error(
                    "Razorpay API keys are invalid. Generate new keys in Razorpay Dashboard and update backend/.env and frontend/.env (see docs/RAZORPAY_SETUP.md)."
                );
            }
            throw new Error(msg);
        }

        const order = orderResponse.data.message;
        if (!order?.id || !order?.amount || !order?.currency) {
            throw new Error("Invalid order response from server");
        }

        const options = {
            key: RAZORPAY_KEY,
            currency: order.currency,
            amount: order.amount,
            order_id: order.id,
            name: "Axiora",
            description: "Thank you for purchasing the course",
            image: rzpLogo,
            prefill: {
                name: userDetails?.firstName || "",
                email: userDetails?.email || "",
            },
            theme: { color: "#FFD60A" },
            method: {
                upi: true,
                card: true,
                netbanking: true,
                wallet: true,
            },
            handler: function (response) {
                sendPaymentSuccessEmail(response, order.amount, token);
                verifyPayment({ ...response, coursesId }, token, navigate, dispatch);
            },
        };

        const paymentObject = new window.Razorpay(options);

        paymentObject.on("payment.failed", function (response) {
            toast.error(response?.error?.description || "Payment failed");
            console.log("payment failed:", response.error);
        });

        paymentObject.open();
    } catch (error) {
        console.log("PAYMENT API ERROR:", error?.response?.data || error);
        toast.error(getErrorMessage(error));
    } finally {
        toast.dismiss(toastId);
    }
}


// ================ send Payment Success Email ================
async function sendPaymentSuccessEmail(response, amount, token) {
    try {
        await apiConnector("POST", SEND_PAYMENT_SUCCESS_EMAIL_API, {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            amount,
        }, {
            Authorization: `Bearer ${token}`
        })
    }
    catch (error) {
        console.log("PAYMENT SUCCESS EMAIL ERROR....", error);
    }
}


// ================ verify payment ================
async function verifyPayment(bodyData, token, navigate, dispatch) {
    const toastId = toast.loading("Verifying Payment....");
    dispatch(setPaymentLoading(true));

    try {
        const response = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
            Authorization: `Bearer ${token}`,
        })

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        toast.success("Payment successful! You are enrolled in the course.");
        navigate("/dashboard/enrolled-courses");
        dispatch(resetCart());
    }
    catch (error) {
        console.log("PAYMENT VERIFY ERROR....", error);
        toast.error("Could not verify payment");
    }
    toast.dismiss(toastId);
    dispatch(setPaymentLoading(false));
}
