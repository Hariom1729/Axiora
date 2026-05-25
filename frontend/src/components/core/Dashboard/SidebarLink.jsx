import * as Icons from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { NavLink, matchPath, useLocation } from "react-router-dom"

import { resetCourseState } from "../../../slices/courseSlice"
import { setOpenSideMenu } from "../../../slices/sidebarSlice"



export default function SidebarLink({ link, iconName }) {
  const Icon = Icons[iconName]
  const location = useLocation()
  const dispatch = useDispatch()

  const { openSideMenu, screenSize } = useSelector(state => state.sidebar)

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  const handleClick = () => {
    dispatch(resetCourseState())
    if (openSideMenu && screenSize <= 640) dispatch(setOpenSideMenu(false))
  }

  return (
    <NavLink
      to={link.path}
      onClick={handleClick}
      className={`relative px-8 py-3 text-sm font-medium ${matchRoute(link.path)
        ? "bg-richblack-800/80 text-blue-300 shadow-[inset_4px_0_0_0_rgba(96,165,250,1)] bg-gradient-to-r from-blue-500/10 to-transparent"
        : "text-richblack-300 hover:bg-richblack-700/40 hover:text-white duration-200"
        } transition-all overflow-hidden group`}
    >
      <div className="flex items-center gap-x-3 relative z-10">
        <Icon className={`text-xl transition-transform duration-200 ${matchRoute(link.path) ? "scale-110" : "group-hover:scale-110 group-hover:text-pink-300"}`} />
        <span>{link.name}</span>
      </div>

    </NavLink>
  )
}