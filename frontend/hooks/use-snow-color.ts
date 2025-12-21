import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function useSnowColor() {
  const { resolvedTheme } = useTheme()
  const [color, setColor] = useState("#82C3D9")

  useEffect(() => {
    if (resolvedTheme === "dark") {
      setColor("#e8c376") // gold accent for dark mode
    } else {
      setColor("#82C3D9") // original blue for light mode
    }
  }, [resolvedTheme])

  return color
}
