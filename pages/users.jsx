import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../components/sidebar';
import { fetchAllUsers, deleteUser, fetchUserById, toast } from '../service/service';
import { 
  Users, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  X,
  Mail,
  Phone,
  Calendar,
  User,
  Shield
} from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalLoading, setUserModalLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetchAllUsers(router);
      if (response.success) {
        setUsers(response.data || []);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await deleteUser(userId, router);
        if (response.success) {
          toast.success('User deleted successfully');
          loadUsers(); // Reload the list
        } else {
          toast.error('Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Error deleting user');
      }
    }
  };

  const handleEditUser = (userId) => {
    // Navigate to edit user page (you can implement this later)
    router.push(`/users/edit/${userId}`);
  };

  const handleViewUser = async (userId) => {
    try {
      setUserModalLoading(true);
      setShowUserModal(true);
      
      const response = await fetchUserById(userId, router);
      if (response.success) {
        setSelectedUser(response.data);
      } else {
        toast.error('Failed to load user details');
        setShowUserModal(false);
      }
    } catch (error) {
      console.error('Error loading user details:', error);
      toast.error('Error loading user details');
      setShowUserModal(false);
    } finally {
      setUserModalLoading(false);
    }
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm);
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      admin: 'bg-red-100 text-red-800',
      user: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    );
  };

  const formatBirthday = (birthday) => {
    if (!birthday) return 'Not provided';
    return `${birthday.day} ${birthday.month} ${birthday.year}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-[240px] p-8">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-[240px] p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Users</h1>
              <p className="text-gray-600 mt-2">Manage all registered users</p>
            </div>
                         {/* <div className="flex items-center space-x-3">
               <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                 <Download className="h-4 w-4 mr-2" />
                 Export
               </button>
               <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                 <Plus className="h-4 w-4 mr-2" />
                 Add User
               </button>
             </div> */}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Role Filter */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
            
            <div className="text-sm text-gray-500">
              {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.avatar}
                              alt={user.fullName}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {user.fullName?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user._id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                       <div className="flex items-center space-x-2">
                         <button
                           onClick={() => handleViewUser(user._id)}
                           className="text-blue-600 hover:text-blue-900 p-1"
                           title="View User"
                         >
                           <Eye className="h-4 w-4" />
                         </button>
                         {/* <button
                           onClick={() => handleEditUser(user._id)}
                           className="text-green-600 hover:text-green-900 p-1"
                           title="Edit User"
                         >
                           <Edit className="h-4 w-4" />
                         </button>
                         <button
                           onClick={() => handleDeleteUser(user._id)}
                           className="text-red-600 hover:text-red-900 p-1"
                           title="Delete User"
                         >
                           <Trash2 className="h-4 w-4" />
                         </button> */}
                       </div>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterRole !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding a new user.'
                }
              </p>
            </div>
                     )}
         </div>
       </div>

       {/* User Details Modal */}
       {showUserModal && (
         <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
             {/* Modal Header */}
             <div className="flex items-center justify-between p-6 border-b border-gray-200">
               <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
               <button
                 onClick={closeUserModal}
                 className="text-gray-400 hover:text-gray-600 p-1"
               >
                 <X className="h-6 w-6" />
               </button>
             </div>

             {/* Modal Content */}
             <div className="p-6">
               {userModalLoading ? (
                 <div className="flex items-center justify-center py-12">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                 </div>
               ) : selectedUser ? (
                 <div className="space-y-6">
                   {/* User Avatar and Basic Info */}
                   <div className="flex items-center space-x-4">
                     <div className="flex-shrink-0">
                       {selectedUser.avatar ? (
                         <img
                           className="h-16 w-16 rounded-full"
                           src={selectedUser.avatar}
                           alt={selectedUser.fullName}
                         />
                       ) : (
                         <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                           <span className="text-blue-600 font-bold text-xl">
                             {selectedUser.fullName?.charAt(0)?.toUpperCase()}
                           </span>
                         </div>
                       )}
                     </div>
                     <div>
                       <h3 className="text-lg font-semibold text-gray-900">
                         {selectedUser.fullName}
                       </h3>
                       <p className="text-sm text-gray-500">User ID: {selectedUser._id}</p>
                       <div className="mt-1">
                         {getRoleBadge(selectedUser.role)}
                       </div>
                     </div>
                   </div>

                   {/* Contact Information */}
                   <div className="bg-gray-50 rounded-lg p-4">
                     <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                       <Mail className="h-4 w-4 mr-2" />
                       Contact Information
                     </h4>
                     <div className="space-y-2">
                       <div className="flex items-center text-sm">
                         <span className="font-medium text-gray-600 w-20">Email:</span>
                         <span className="text-gray-900">{selectedUser.email}</span>
                       </div>
                       <div className="flex items-center text-sm">
                         <span className="font-medium text-gray-600 w-20">Phone:</span>
                         <span className="text-gray-900">{selectedUser.phone}</span>
                       </div>
                     </div>
                   </div>

                   {/* Personal Information */}
                   <div className="bg-gray-50 rounded-lg p-4">
                     <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                       <User className="h-4 w-4 mr-2" />
                       Personal Information
                     </h4>
                     <div className="space-y-2">
                       <div className="flex items-center text-sm">
                         <span className="font-medium text-gray-600 w-24">Full Name:</span>
                         <span className="text-gray-900">{selectedUser.fullName}</span>
                       </div>
                       <div className="flex items-center text-sm">
                         <span className="font-medium text-gray-600 w-24">Birthday:</span>
                         <span className="text-gray-900">{formatBirthday(selectedUser.birthday)}</span>
                       </div>
                       <div className="flex items-center text-sm">
                         <span className="font-medium text-gray-600 w-24">How did you hear:</span>
                         <span className="text-gray-900">{selectedUser.howDidYouHear || 'Not provided'}</span>
                       </div>
                     </div>
                   </div>

                   {/* Account Information */}
                   <div className="bg-gray-50 rounded-lg p-4">
                     <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                       <Shield className="h-4 w-4 mr-2" />
                       Account Information
                     </h4>
                     <div className="space-y-2">
                       <div className="flex items-center text-sm">
                         <span className="font-medium text-gray-600 w-24">Role:</span>
                         <span className="text-gray-900">{getRoleBadge(selectedUser.role)}</span>
                       </div>
                       <div className="flex items-center text-sm">
                         <span className="font-medium text-gray-600 w-24">Joined:</span>
                         <span className="text-gray-900">{formatDate(selectedUser.createdAt)}</span>
                       </div>
                       {selectedUser.governmentId && (
                         <div className="flex items-center text-sm">
                           <span className="font-medium text-gray-600 w-24">Government ID:</span>
                           <span className="text-gray-900">{selectedUser.governmentId}</span>
                         </div>
                       )}
                     </div>
                   </div>

                   {/* Additional Information */}
                   {selectedUser.avatar && (
                     <div className="bg-gray-50 rounded-lg p-4">
                       <h4 className="text-sm font-medium text-gray-700 mb-3">Profile Picture</h4>
                       <img
                         src={selectedUser.avatar}
                         alt={selectedUser.fullName}
                         className="h-32 w-32 rounded-lg object-cover"
                       />
                     </div>
                   )}
                 </div>
               ) : (
                 <div className="text-center py-12">
                   <p className="text-gray-500">No user data available</p>
                 </div>
               )}
             </div>

             {/* Modal Footer */}
             <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
               <button
                 onClick={closeUserModal}
                 className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
               >
                 Close
               </button>
               <button
                 onClick={() => {
                   closeUserModal();
                   handleEditUser(selectedUser._id);
                 }}
                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
               >
                 <Edit className="h-4 w-4 mr-2" />
                 Edit User
               </button>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 }
