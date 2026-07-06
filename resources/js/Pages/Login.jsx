import GuestLayout from '@/Layouts/GuestLayout'

const Login = () => {
  return (
    <GuestLayout>
      <section className='container mx-auto px-4 min-h-screen flex flex-col items-center gap-4 justify-center'>
        <div className='text-center'>
          <h1 className="text-primary display tracking-tight mb-2">Job Aggregator</h1>
          <p className="body max-w-sm">Semua lowongan kerja, dalam satu platform</p>
        </div>

        <div className='w-full max-w-sm md:max-w-md 2xl:max-w-lg bg-white p-gutter border border-outline-variant rounded-md shadow-[0_4px_6px_-1px_rgb(0,0,0,0.1)] text-center 
        flex flex-col items-center gap-stack-lg'>
          <button className='flex items-center justify-center gap-stack-sm bg-primary text-white label-md py-3 px-6 rounded-sm
                            hover:opacity-90 transition-opacity active:opacity-80 w-full cursor-pointer'>
            <svg className="w-5 h-5 bg-white rounded-full p-0.5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.81 15.69 17.6V20.36H19.26C21.35 18.44 22.56 15.6 22.56 12.25Z" fill="#4285F4"></path>
              <path d="M12 23C14.97 23 17.46 22.02 19.26 20.36L15.69 17.6C14.71 18.26 13.47 18.65 12 18.65C9.15 18.65 6.74 16.73 5.86 14.14H2.18V16.99C4.01 20.61 7.74 23 12 23Z" fill="#34A853"></path>
              <path d="M5.86 14.14C5.64 13.48 5.51 12.76 5.51 12C5.51 11.24 5.64 10.52 5.86 9.86V7.01H2.18C1.43 8.5 1 10.2 1 12C1 13.8 1.43 15.5 2.18 16.99L5.86 14.14Z" fill="#FBBC05"></path>
              <path d="M12 5.35C13.62 5.35 15.07 5.91 16.21 7.01L19.34 3.88C17.45 2.12 14.97 1 12 1C7.74 1 4.01 3.39 2.18 7.01L5.86 9.86C6.74 7.27 9.15 5.35 12 5.35Z" fill="#EA4335"></path>
            </svg>
            Sign in with google
          </button>

          <p className='label leading-relaxed'>Kami hanya membaca email untuk membantu merapikan pencarian-kerja saya -- tidak ada yang dibagikan ke pihak lain</p>
        </div>
      </section>
    </GuestLayout>
  )
}

export default Login