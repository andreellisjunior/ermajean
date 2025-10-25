import React, { ReactNode } from 'react';

const PageWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className="content-body p-4 lg:p-12 w-full flex flex-col gap-8 max-w-screen-2xl mx-auto">
      {children}
    </div>
  );
};

export default PageWrapper;
