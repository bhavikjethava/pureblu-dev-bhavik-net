import AmcReminderList from '@/components/AMCReminderList';
import { API_ENDPOINTS_ENTERPRISE } from '@/utils/apiConfig';

const AmcReminder = () => {
  return (
    <div className='h-full overflow-hidden p-5'>
      <AmcReminderList apiBaseUrl={API_ENDPOINTS_ENTERPRISE} />
    </div>
  );
};

export default AmcReminder;
