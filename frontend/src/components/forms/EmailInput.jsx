import React from 'react';
import BaseInput from './BaseInput';
import { Mail } from 'lucide-react';

export default function EmailInput(props) {
  return (
    <BaseInput
      type="email"
      leftIcon={<Mail className="h-4 w-4" />}
      {...props}
    />
  );
}
