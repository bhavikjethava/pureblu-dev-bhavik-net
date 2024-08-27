// components/Loader.tsx

const Loader: React.FC = () => {
  return (
    <div className='fixed left-0 top-0 z-10 flex h-screen w-full items-center justify-center bg-black bg-opacity-20'>
      <div
        className='inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]'
        role='status'
      >
        <span className='!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]'>
          Loading...
        </span>
      </div>
    </div>
  );
};

export default Loader;
