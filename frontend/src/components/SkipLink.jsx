/**
 * Skip Navigation Link Component
 * Allows keyboard users to skip directly to main content
 * WCAG 2.4.1: Bypass Blocks
 */
export default function SkipLink({ targetId = 'main-content', children = 'Skip to main content' }) {
  const handleClick = (e) => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    if (target) {
      target.focus()
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="skip-link"
    >
      {children}
    </a>
  )
}
