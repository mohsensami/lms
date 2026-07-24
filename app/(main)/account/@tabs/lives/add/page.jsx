import { requireRole } from '@/lib/require-role';
import AddLiveForm from '../_components/add-live-form';

const AddLive = async () => {
    await requireRole('instructor');
    return <AddLiveForm />;
};

export default AddLive;
