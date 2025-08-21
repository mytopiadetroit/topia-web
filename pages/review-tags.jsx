import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import { 
  fetchAllReviewTags, 
  createReviewTagApi, 
  updateReviewTagApi, 
  deleteReviewTagApi, 
  toast 
} from '@/service/service';
import Swal from 'sweetalert2';

export default function ReviewTagsPage() {
  const router = useRouter();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // add | edit
  const [current, setCurrent] = useState({ _id: '', label: '', isActive: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadTags(); }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const res = await fetchAllReviewTags(router);
      if (res.success) setTags(res.data || []);
      else toast.error(res.message || 'Failed to load review tags');
    } catch (e) {
      console.error(e);
      toast.error('Failed to load review tags');
    } finally { setLoading(false); }
  };

  const filtered = tags.filter(t => 
    (t.label || '').toLowerCase().includes(search.trim().toLowerCase())
  );

  const openAdd = () => {
    setModalMode('add');
    setCurrent({ _id: '', label: '', isActive: true });
    setShowModal(true);
  };

  const openEdit = (t) => {
    setModalMode('edit');
    setCurrent({ ...t });
    setShowModal(true);
  };

  const remove = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });
  
    if (!result.isConfirmed) return;
  
    try {
      const res = await deleteReviewTagApi(id, router);
      if (res.success) { 
        Swal.fire('Deleted!', 'Review tag has been deleted.', 'success');
        loadTags(); 
      } else {
        Swal.fire('Error!', res.message || 'Delete failed', 'error');
      }
    } catch (e) { 
      Swal.fire('Error!', 'Delete failed', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { label: current.label, isActive: !!current.isActive };
      const res = modalMode === 'add' 
        ? await createReviewTagApi(payload, router)
        : await updateReviewTagApi(current._id, payload, router);
      if (res.success) {
        Swal.fire('Success!', `Review tag ${modalMode === 'add' ? 'created' : 'updated'} successfully!`, 'success');
        setShowModal(false);
        loadTags();
      } else {
        Swal.fire('Error!', res.message || 'Save failed', 'error');
      }
    } catch (e) {
      Swal.fire('Error!', 'Save failed', 'error');
    } finally { setSaving(false); }
  };

  return (
    <Layout title="Review Tags">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <input 
              value={search} 
              onChange={(e)=>setSearch(e.target.value)} 
              placeholder="Search tags" 
              className="px-3 py-2 border rounded-md text-sm w-64" 
            />
          </div>
          <button onClick={openAdd} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
            Add Tag
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500">
                  <th className="px-4 py-3">LABEL</th>
                  <th className="px-4 py-3">ACTIVE</th>
                  <th className="px-4 py-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t._id} className="border-t">
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="font-medium">{t.label}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {t.isActive ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(t)} className="text-blue-600 hover:text-blue-800 mr-3 text-sm">Edit</button>
                      <button onClick={() => remove(t._id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-10 text-gray-500">No tags found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{modalMode === 'add' ? 'Add Review Tag' : 'Edit Review Tag'}</h3>
              <button onClick={()=>setShowModal(false)} className="text-gray-500">✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Label</label>
                  <input 
                    value={current.label} 
                    onChange={(e)=>setCurrent({...current, label: e.target.value})} 
                    required 
                    className="w-full px-3 py-2 border rounded-md" 
                    placeholder="e.g. Awesome, Nice, Good" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Active</label>
                  <select 
                    value={current.isActive ? '1':'0'} 
                    onChange={(e)=>setCurrent({...current, isActive: e.target.value==='1'})} 
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 border rounded-md">Cancel</button>
                <button disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md">
                  {saving ? 'Saving...' : modalMode === 'add' ? 'Create' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
