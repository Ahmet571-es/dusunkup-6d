import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error: string }

export default class GameErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center" style={{ background: '#060A1A', fontFamily: 'var(--font-child)' }}>
          <span className="text-6xl mb-4">🔧</span>
          <p className="text-white text-lg font-bold mb-2">Bir sorun oluştu</p>
          <p className="text-white/40 text-sm mb-4">{this.state.error}</p>
          <button onClick={() => { this.setState({ hasError: false, error: '' }); window.location.href = '/galaxy' }}
            className="px-6 py-2 rounded-xl bg-blue-500/20 text-blue-300 text-sm font-bold border border-blue-500/20">
            ← Galaksiye Dön
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
