export default function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          border: '2px solid var(--gray-200)',
          borderTop: '2px solid var(--brand-500)',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }}
      />
    </div>
  )
}
