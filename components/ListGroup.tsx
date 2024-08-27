import React, { ReactNode } from 'react';

interface ListGroupProps {
  className?: string;
  children?: ReactNode;
}

const ListGroup: React.FC<ListGroupProps> = ({ className, children }) => (
  <dl className={`divide-y divide-gray-200 text-sm  ${className}`}>
    {children}
  </dl>
);

export default ListGroup;
