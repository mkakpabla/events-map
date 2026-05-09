import { useState, useEffect } from 'react'
import VariantA from './variants/VariantA.jsx'
import VariantB from './variants/VariantB.jsx'
import VariantC from './variants/VariantC.jsx'
import TweaksPanel from './components/TweaksPanel.jsx'
import { TWEAK_DEFAULTS } from './data/constants.js'

export default function App() {
  const [tweaks, setTweaks]             = useState(TWEAK_DEFAULTS)
  const [tweaksVisible, setTweaksVisible] = useState(false)

  const onChange = (k, v) => {
    const next = { ...tweaks, [k]: v }
    setTweaks(next)
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*')
  }

  useEffect(() => {
    const handler = e => {
      if (e.data?.type === '__activate_edit_mode')   setTweaksVisible(true)
      if (e.data?.type === '__deactivate_edit_mode') setTweaksVisible(false)
    }
    window.addEventListener('message', handler)
    window.parent.postMessage({ type: '__edit_mode_available' }, '*')
    return () => window.removeEventListener('message', handler)
  }, [])

  const close = () => {
    setTweaksVisible(false)
    window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*')
  }

  const variantProps = {
    theme:      tweaks.theme,
    compact:    tweaks.compactCards,
    showTypes:  tweaks.showTypes,
    popupDesign: tweaks.popupDesign,
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <VariantA {...variantProps} />
      <TweaksPanel tweaks={tweaks} onChange={onChange} visible={tweaksVisible} onClose={close} />
    </div>
  )
}
