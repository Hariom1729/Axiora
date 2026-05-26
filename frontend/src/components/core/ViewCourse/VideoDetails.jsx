import React, { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLocation } from "react-router-dom"
import { useNavigate, useParams } from "react-router-dom"

import "video-react/dist/video-react.css"
import { BigPlayButton, Player } from "video-react"

import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI"
import { updateCompletedLectures } from "../../../slices/viewCourseSlice"
import { setCourseViewSidebar } from "../../../slices/sidebarSlice"

import IconBtn from "../../common/IconBtn"

import { HiMenuAlt1 } from 'react-icons/hi'
import { FaCloud, FaPlay } from 'react-icons/fa'


const VideoDetails = () => {
  const { courseId, sectionId, subSectionId } = useParams()

  const navigate = useNavigate()
  const location = useLocation()
  const playerRef = useRef(null)
  const iframeRef = useRef(null)
  const ytPlayerRef = useRef(null)
  const dispatch = useDispatch()

  const { token } = useSelector((state) => state.auth)
  const { courseSectionData, courseEntireData, completedLectures } = useSelector((state) => state.viewCourse)

  const [videoData, setVideoData] = useState([])
  const [previewSource, setPreviewSource] = useState("")
  const [videoEnded, setVideoEnded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ytApiReady, setYtApiReady] = useState(false)

  // Parse YouTube video ID
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  // Load YouTube API
  useEffect(() => {
    if (getYouTubeId(videoData?.videoUrl)) {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
      
      const checkYtLoaded = setInterval(() => {
        if (window.YT && window.YT.Player) {
          setYtApiReady(true);
          clearInterval(checkYtLoaded);
        }
      }, 100);

      return () => clearInterval(checkYtLoaded);
    }
  }, [videoData?.videoUrl])

  // Initialize YouTube Player Instance
  useEffect(() => {
    const videoId = getYouTubeId(videoData?.videoUrl);
    if (ytApiReady && videoId && iframeRef.current) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          console.error(e);
        }
        ytPlayerRef.current = null;
      }

      ytPlayerRef.current = new window.YT.Player(iframeRef.current, {
        events: {
          onStateChange: (event) => {
            // event.data === 0 (YT.PlayerState.ENDED)
            if (event.data === 0) {
              setVideoEnded(true)
            } else if (event.data === 1) {
              // Playing
              setVideoEnded(false)
            }
          }
        }
      });
    }

    return () => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          console.error(e);
        }
        ytPlayerRef.current = null;
      }
    };
  }, [ytApiReady, videoData?.videoUrl, subSectionId])

  useEffect(() => {
    ; (async () => {
      if (!courseSectionData.length) return
      if (!courseId && !sectionId && !subSectionId) {
        navigate(`/dashboard/enrolled-courses`)
      } else {
        // console.log("courseSectionData", courseSectionData)
        const filteredData = courseSectionData.filter(
          (course) => course._id === sectionId
        )
        // console.log("filteredData", filteredData)
        const filteredVideoData = filteredData?.[0]?.subSection.filter(
          (data) => data._id === subSectionId
        )
        // console.log("filteredVideoData = ", filteredVideoData)
        if (filteredVideoData) setVideoData(filteredVideoData[0])
        setPreviewSource(courseEntireData.thumbnail)
        setVideoEnded(false)
      }
    })()
  }, [courseSectionData, courseEntireData, location.pathname])

  // check if the lecture is the first video of the course
  const isFirstVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId)

    const currentSubSectionIndx = courseSectionData[currentSectionIndx].subSection.findIndex((data) => data._id === subSectionId)

    if (currentSectionIndx === 0 && currentSubSectionIndx === 0) {
      return true
    } else {
      return false
    }
  }

  // go to the next video
  const goToNextVideo = () => {
    // console.log(courseSectionData)

    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId)

    const noOfSubsections = courseSectionData[currentSectionIndx].subSection.length

    const currentSubSectionIndx = courseSectionData[currentSectionIndx].subSection.findIndex((data) => data._id === subSectionId)

    // console.log("no of subsections", noOfSubsections)

    if (currentSubSectionIndx !== noOfSubsections - 1) {
      const nextSubSectionId = courseSectionData[currentSectionIndx].subSection[currentSubSectionIndx + 1]._id

      navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`)
    } else {
      const nextSectionId = courseSectionData[currentSectionIndx + 1]._id
      const nextSubSectionId = courseSectionData[currentSectionIndx + 1].subSection[0]._id
      navigate(`/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`)
    }
  }

  // check if the lecture is the last video of the course
  const isLastVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId)

    const noOfSubsections = courseSectionData[currentSectionIndx].subSection.length

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId)

    if (
      currentSectionIndx === courseSectionData.length - 1 &&
      currentSubSectionIndx === noOfSubsections - 1
    ) {
      return true
    } else {
      return false
    }
  }

  // go to the previous video
  const goToPrevVideo = () => {
    // console.log(courseSectionData)

    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId)

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId)

    if (currentSubSectionIndx !== 0) {
      const prevSubSectionId = courseSectionData[currentSectionIndx].subSection[currentSubSectionIndx - 1]._id
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`
      )
    } else {
      const prevSectionId = courseSectionData[currentSectionIndx - 1]._id
      const prevSubSectionLength = courseSectionData[currentSectionIndx - 1].subSection.length
      const prevSubSectionId = courseSectionData[currentSectionIndx - 1].subSection[prevSubSectionLength - 1]._id
      navigate(
        `/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`
      )
    }
  }

  // handle Lecture Completion
  const handleLectureCompletion = async () => {
    setLoading(true)
    const res = await markLectureAsComplete(
      { courseId: courseId, subsectionId: subSectionId },
      token
    )
    if (res) {
      dispatch(updateCompletedLectures(subSectionId))
    }
    setLoading(false)
  }

  const handleRewatch = () => {
    setVideoEnded(false)
    const ytId = getYouTubeId(videoData?.videoUrl)
    if (ytId && ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      ytPlayerRef.current.seekTo(0);
      ytPlayerRef.current.playVideo();
    } else if (playerRef.current) {
      playerRef.current.seek(0)
    }
  }

  const { courseViewSidebar } = useSelector(state => state.sidebar)

  // this will hide course video , title , desc, if sidebar is open in small device
  // for good looking i have try this 
  if (courseViewSidebar && window.innerWidth <= 640) return;

  const youTubeId = getYouTubeId(videoData?.videoUrl)

  return (
    <div className="flex flex-col gap-5 text-white">

      {/* open - close side bar icons */}
      <div className="sm:hidden text-white absolute left-7 top-3 cursor-pointer " onClick={() => dispatch(setCourseViewSidebar(!courseViewSidebar))}>
        {
          !courseViewSidebar && <HiMenuAlt1 size={33} />
        }
      </div>


      {!videoData ? (
        <img
          src={previewSource}
          alt="Preview"
          className="h-full w-full rounded-md object-cover"
        />
      ) : youTubeId ? (
        // Custom Styled YouTube Playbox Area
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border border-richblack-800 group">
          
          {/* Top Custom Branding Overlay (Covers YouTube title bar) */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/95 to-transparent flex items-center justify-between pointer-events-none z-10">
            <div className="flex items-center gap-2">
              <FaCloud className="text-blue-200 animate-pulse text-lg" />
              <span className="text-xs font-semibold tracking-wider text-richblack-200 uppercase font-mono">
                Cloud Secure Stream
              </span>
            </div>
            <span className="text-xs font-medium text-richblack-400 bg-richblack-900/80 px-2.5 py-1 rounded-full border border-richblack-800">
              1080p Encrypted
            </span>
          </div>

          {/* YouTube Embed Iframe */}
          <iframe
            ref={iframeRef}
            id="youtube-player"
            src={`https://www.youtube.com/embed/${youTubeId}?enablejsapi=1&autoplay=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&controls=1&fs=1&disablekb=0`}
            title={videoData?.title}
            className="w-full h-full border-0 absolute inset-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>

          {/* Bottom Right Floating Badge (Masks pause watermarks) */}
          <div className="absolute bottom-14 right-4 bg-richblack-900/90 text-richblack-200 text-xs px-2.5 py-1.5 rounded-md border border-richblack-800 shadow-md flex items-center gap-1.5 z-10 select-none pointer-events-none transition-opacity duration-300 opacity-90 group-hover:opacity-100">
            <FaCloud className="text-blue-300" />
            <span className="font-mono text-[10px] tracking-wide uppercase font-semibold">Secure Cloud Player</span>
          </div>

          {/* Ended State Overlay */}
          {videoEnded && (
            <div
              style={{
                backgroundImage:
                  "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.85), rgba(0,0,0,0.7), rgba(0,0,0,0.4))",
              }}
              className="absolute inset-0 z-[20] grid h-full place-content-center font-inter"
            >
              {!completedLectures.includes(subSectionId) && (
                <IconBtn
                  disabled={loading}
                  onclick={handleLectureCompletion}
                  text={!loading ? "Mark As Completed" : "Loading..."}
                  customClasses="text-xl max-w-max px-6 mx-auto shadow-lg"
                />
              )}
              <IconBtn
                disabled={loading}
                onclick={handleRewatch}
                text="Rewatch Video"
                customClasses="text-xl max-w-max px-6 mx-auto mt-2 shadow-lg"
              />

              <div className="mt-10 flex min-w-[250px] justify-center gap-x-4 text-xl">
                {!isFirstVideo() && (
                  <button
                    disabled={loading}
                    onClick={goToPrevVideo}
                    className="blackButton"
                  >
                    Prev
                  </button>
                )}
                {!isLastVideo() && (
                  <button
                    disabled={loading}
                    onClick={goToNextVideo}
                    className="blackButton"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Player
          ref={playerRef}
          aspectRatio="16:9"
          playsInline
          autoPlay
          onEnded={() => setVideoEnded(true)}
          src={videoData?.videoUrl}
        >
          <BigPlayButton position="center" />
          {/* Render When Video Ends */}
          {videoEnded && (
            <div
              style={{
                backgroundImage:
                  "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)",
              }}
              className="full absolute inset-0 z-[100] grid h-full place-content-center font-inter"
            >
              {!completedLectures.includes(subSectionId) && (
                <IconBtn
                  disabled={loading}
                  onclick={() => handleLectureCompletion()}
                  text={!loading ? "Mark As Completed" : "Loading..."}
                  customClasses="text-xl max-w-max px-4 mx-auto"
                />
              )}
              <IconBtn
                disabled={loading}
                onclick={handleRewatch}
                text="Rewatch"
                customClasses="text-xl max-w-max px-4 mx-auto mt-2"
              />

              <div className="mt-10 flex min-w-[250px] justify-center gap-x-4 text-xl">
                {!isFirstVideo() && (
                  <button
                    disabled={loading}
                    onClick={goToPrevVideo}
                    className="blackButton"
                  >
                    Prev
                  </button>
                )}
                {!isLastVideo() && (
                  <button
                    disabled={loading}
                    onClick={goToNextVideo}
                    className="blackButton"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </Player>
      )}

      <h1 className="mt-4 text-3xl font-semibold">{videoData?.title}</h1>
      <p className="pt-2 pb-6">{videoData?.description}</p>
    </div>
  )
}

export default VideoDetails
