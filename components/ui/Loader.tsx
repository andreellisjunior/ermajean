'use client';

const Loader = ({ color }: { color?: 'primary' | 'secondary' | 'danger' }) => {
  const colors = {
    primary: `border-primary`,
    secondary: `border-gray-400`,
    danger: `border-red-500`,
  };

  return (
    <div
      className={`inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-r-transparent ${
        color ? colors[color] : `border-white`
      }  align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`}
      role='status'
    >
      <span className='!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]'>
        Loading...
      </span>
    </div>
  );
};

export default Loader;
