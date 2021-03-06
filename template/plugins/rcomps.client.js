/**
 * Use Rcomps as Nuxt plugin so you can call it when mounting the component.
 * On the other hand, the size of the container cannot be determined.
 * @param ctx
 * @param inject
 */
export default function (ctx, inject) {
  const rcomps = (breakpoints) => {
    if (process.client) {
      if (typeof ResizeObserver === 'undefined') return false

      const defaultBreakpoints =
        typeof breakpoints === 'object'
          ? breakpoints
          : { xs: 320, sm: 560, m: 768, l: 960, xl: 1200 }

      const ro = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.target.updateBreakpoints) {
            entry.target.updateBreakpoints(entry.contentRect.width)
          } else {
            const breakpoints = entry.target.dataset.breakpoints
              ? JSON.parse(entry.target.dataset.breakpoints)
              : defaultBreakpoints

            // Put Breakpoints in a array
            const breakpointArr = Object.keys(breakpoints)

            // For non-custom-elements, use the data-obsevering attribute
            // to target observed elements in CSS.
            entry.target.dataset.observing = entry.width === 0

            // Update the matching breakpoints on the target element.
            Object.keys(breakpoints).forEach((breakpoint) => {
              const minWidth = breakpoints[breakpoint]
              if (entry.contentRect.width >= minWidth) {
                // Clean up the classlist if only one class of the object may be active
                if (entry.target.hasAttribute('data-utility')) {
                  entry.target.classList.remove(...breakpointArr)
                }
                entry.target.classList.add(breakpoint)
              } else {
                entry.target.classList.remove(breakpoint)
              }
            })
          }
        })
      })

      // Iterates through a subtree
      // function eachObserveableElement (nodes, fn) {
      const eachObserveableElement = (nodes, fn) => {
        if (nodes) {
          ;[].slice.call(nodes).forEach(function (node) {
            if (node.nodeType === 1) {
              const containers = [].slice.call(
                node.querySelectorAll('[data-observe-resizes]')
              )
              if (node.hasAttribute('data-observe-resizes')) {
                containers.push(node)
              }
              for (let container, i = 0; (container = containers[i]); i++) {
                fn(container)
              }
            }
          })
        }
      }

      // Observe all non-custom element containers, i.e. all elements with the
      // `data-observe-resizes` attribute. Note: custom element containers
      // are observed via the connectedCallback() lifecycle method.

      const elements = [...document.querySelectorAll('[data-observe-resizes]')]
      elements.forEach((element) => {
        ro.observe(element)
      })

      // Monitor the DOM for changes for non-custom-element containers.
      const mo = new MutationObserver(function (entries) {
        entries.forEach(function (entry) {
          eachObserveableElement(entry.addedNodes, ro.observe.bind(ro))
        })
      })
      mo.observe(document.body, { childList: true, subtree: true })
    }
  }

  inject('rcomps', rcomps)
}
