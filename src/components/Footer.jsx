export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#2e3132', marginTop: '32px' }} className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg px-container-margin py-xl max-w-7xl mx-auto w-full">
        <div className="space-y-md">
          <div className="font-bold text-primary-fixed" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '20px' }}>
            BusRoute PK
          </div>
          <p className="text-surface-variant max-w-xs" style={{ fontSize: '14px' }}>
            Building the future of urban mobility for the city of lights. Join the revolution.
          </p>
          <div className="text-surface-variant" style={{ fontSize: '14px' }}>
            © 2026 BusRoute PK. Smart Transit for Karachi.
          </div>
        </div>
        <div className="grid grid-cols-2 gap-lg">
          <div className="flex flex-col gap-sm">
            <a href="#" className="text-surface-variant hover:text-secondary-fixed transition-colors" style={{ fontSize: '12px' }}>
              Privacy Policy
            </a>
            <a href="#" className="text-surface-variant hover:text-secondary-fixed transition-colors" style={{ fontSize: '12px' }}>
              Terms of Service
            </a>
          </div>
          <div className="flex flex-col gap-sm">
            <a href="#" className="text-surface-variant hover:text-secondary-fixed transition-colors" style={{ fontSize: '12px' }}>
              Contact Us
            </a>
            <a href="#" className="text-surface-variant hover:text-secondary-fixed transition-colors" style={{ fontSize: '12px' }}>
              Help Center
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
