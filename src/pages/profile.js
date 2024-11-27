import React, { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import SideNavbar from "../components/sidenavbar";
import ProfileModal from "../components/profileModal";
import ConfirmationModal from "../components/confirmationModal";
import { useRouter } from 'next/router';
import axios from 'axios';

const Profile = () => {
  const [showModal, setShowModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullname: '',
    emailaddress: '',
    contactnumber: '',
    address: '',
    password: ''
  });
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const authResponse = await axios.get('/api/check-auth');
        if (!authResponse.data.isAuthenticated) {
          router.push('/login?redirect=/profile');
          return;
        }

        const profileResponse = await axios.get('/api/profile');
        setProfile(profileResponse.data);
        // Initialize form with profile data, ensuring no null values
        setEditForm({
          fullname: profileResponse.data.fullname || '',
          emailaddress: profileResponse.data.emailaddress || '',
          contactnumber: profileResponse.data.contactnumber || '',
          address: profileResponse.data.address || '',
          password: ''
        });
      } catch (error) {
        console.error('Error:', error);
        if (error.response?.status === 401) {
          router.push('/login?redirect=/profile');
        }
      }
    };

    fetchProfile();
  }, [router]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Reset form to current profile values when entering edit mode
      setEditForm({
        fullname: profile?.fullname || '',
        emailaddress: profile?.emailaddress || '',
        contactnumber: profile?.contactnumber || '',
        address: profile?.address || '',
        password: ''
      });
    }
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/profile', editForm);
      const updatedProfile = await axios.get('/api/profile');
      setProfile(updatedProfile.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-200">
      <SideNavbar />
      <div className="flex-1 p-10">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          {profile ? (
            <>
              {/* Profile Header */}
              <div className="flex items-center mb-6 space-x-4">
                <img
                  src="/prof.png"
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-lg"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{profile.fullname}</h1>
                </div>
              </div>

              {/* Profile Content */}
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="fullname"
                      value={editForm.fullname}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="emailaddress"
                      value={editForm.emailaddress}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                    <input
                      type="text"
                      name="contactnumber"
                      value={editForm.contactnumber}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={editForm.address}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">New Password (leave blank to keep current)</label>
                    <input
                      type="password"
                      name="password"
                      value={editForm.password}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="flex space-x-4 mt-6">
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleEditToggle}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Profile Information</h2>
                  <div className="space-y-3 text-gray-700">
                    <p><strong>Full Name:</strong> {profile.fullname}</p>
                    <p><strong>Email:</strong> {profile.emailaddress}</p>
                    <p><strong>Contact Number:</strong> {profile.contactnumber}</p>
                    <p><strong>Address:</strong> {profile.address}</p>
                  </div>
                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={handleEditToggle}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full flex flex-col items-center bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Loading profile...</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;