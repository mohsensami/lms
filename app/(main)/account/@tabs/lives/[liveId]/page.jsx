import { requireRole } from '@/lib/require-role';
import EditLiveForm from '../_components/edit-live-form';

const EditLive = async () => {
    await requireRole('instructor');
    return <EditLiveForm />;
};

export default EditLive;
