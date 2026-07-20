import React from 'react';
import BaseInput from './BaseInput';
import { Search } from 'lucide-react';

export default function SearchInput(props) {
  return (
    <BaseInput
      type="search"
      leftIcon={<Search className="h-4 w-4" />}
      {...props}
    />
  );
}
