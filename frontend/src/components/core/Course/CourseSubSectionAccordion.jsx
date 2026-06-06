import React from "react"
import { HiOutlineVideoCamera } from "react-icons/hi"
import { FaPlay } from "react-icons/fa"

function CourseSubSectionAccordion({ subSec, handlePlayPreview }) {
  return (
    <div>
      <div 
        className={`flex justify-between py-2 ${subSec?.videoUrl ? "cursor-pointer group" : ""}`}
        onClick={() => {
          if(subSec?.videoUrl && handlePlayPreview) {
             handlePlayPreview(subSec.videoUrl, subSec.title);
          }
        }}
      >
        <div className={`flex items-center gap-2 ${subSec?.videoUrl ? "group-hover:text-yellow-50 transition-colors" : ""}`}>
          <span>
            <HiOutlineVideoCamera />
          </span>
          <p>{subSec?.title}</p>
        </div>
        
        {subSec?.videoUrl && (
          <div className="flex items-center gap-2 text-yellow-50 border border-yellow-50 px-2 py-1 rounded-full text-xs font-semibold group-hover:bg-yellow-50 group-hover:text-black transition-colors">
             <FaPlay className="w-3 h-3" />
             Preview
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseSubSectionAccordion