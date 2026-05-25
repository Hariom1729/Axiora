
import LoginForm from "./LoginForm"
import SignupForm from "./SignupForm"
import Img from './../../common/Img';
import FadeIn from './../../common/animations/FadeIn';
import GlassCard from './../../common/animations/GlassCard';
import SlideUp from './../../common/animations/SlideUp';

function Template({ title, description1, description2, image, formType }) {
  return (
    <div className="min-h-screen w-full flex bg-richblack-900 relative overflow-hidden">
      {/* Background blobs for SaaS feel */}
      <div className="absolute top-0 left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-[-10%] w-[40%] h-[40%] bg-pink-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      {/* Left Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 z-10">
        <SlideUp className="w-full max-w-[480px]">
          <GlassCard className="p-8 sm:p-10 !bg-richblack-800/40">
            <h1 className="text-3xl sm:text-4xl font-bold font-outfit text-white mb-3">
              {title}
            </h1>
            <p className="text-base text-richblack-200 mb-8 leading-relaxed">
              <span>{description1}</span>{" "}
              <span className="font-edu-sa font-bold italic text-blue-300">
                {description2}
              </span>
            </p>

            {formType === "signup" ? <SignupForm /> : <LoginForm />}
          </GlassCard>
        </SlideUp>
      </div>

      {/* Right Image/Illustration Section */}
      <div className="hidden lg:flex w-1/2 items-center justify-center p-12 z-10 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-richblack-900/80 backdrop-blur-sm z-0"></div>
        <FadeIn className="relative z-10 w-full max-w-[600px] h-full max-h-[800px] flex items-center justify-center">
          <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20 group">
            <div className="absolute inset-0 bg-gradient-to-t from-richblack-900/80 via-transparent to-transparent z-10"></div>
            <Img
              src={image}
              alt={formType}
              className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </FadeIn>
      </div>
    </div>
  )
}

export default Template;