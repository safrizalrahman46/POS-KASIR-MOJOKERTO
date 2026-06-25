import { useEffect, useRef, useCallback } from 'react'

export default function useWebSocket(url, onMessage) {
  const ws = useRef(null)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const wsUrl = `${protocol}//${host}${url}`

    ws.current = new WebSocket(wsUrl)

    ws.current.onopen = () => console.log('WS connected:', url)
    ws.current.onclose = () => console.log('WS disconnected:', url)
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessageRef.current(data)
      } catch (e) {
        console.error('WS parse error:', e)
      }
    }

    return () => {
      ws.current?.close()
    }
  }, [url])

  return ws
}
