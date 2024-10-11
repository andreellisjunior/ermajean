import { Message } from '@/components/form-message';
import { toast } from 'react-toastify';

export const toastDisplay = (searchParams: Message) => {
  if ('success' in searchParams) {
    toast(searchParams.success, { type: 'success' });
  } else if ('error' in searchParams) {
    toast(searchParams.error, { type: 'error' });
  } else if ('message' in searchParams) {
    toast(searchParams.message, { type: 'info' });
  }
};
