import React from 'react';
import BaseInput from './BaseInput';
import { Phone } from 'lucide-react';

export default function PhoneInput(props) {
  return (
    <BaseInput
      type="tel"
      leftIcon={<Phone className="h-4 w-4" />}
      {...props}
    />
  );
}
