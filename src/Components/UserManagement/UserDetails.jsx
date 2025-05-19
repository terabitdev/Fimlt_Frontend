

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
import { db } from '../../firebase'; // adjust if needed
import SideBar from '../../Components/SideBar';
import TopBar from '../../Components/TopBar';
import ProjectCard from '../UserManagement/ProjectCard';
import { Edit, Trash2 } from 'lucide-react';

function FacilityDashboard({ userData, projects, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="p-8 text-center text-white">
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E3A5F] rounded-xl">
      {/* User Profile Section */}
      <div className="p-4 pb-6 border-b border-white flex justify-between items-start">
        <div>
          <h2 className="text-white font-[600] mb-1">
            Name: <span className="font-[400]">{userData.name}</span>
          </h2>
          <h2 className="text-white font-[600] mb-1">
            Email: <span className="font-[400]">{userData.email}</span>
          </h2>
          <h2 className="text-white font-[600] mb-1">
            Role: <span className="font-[400]">{userData.role}</span>
          </h2>
          <h2 className="text-white font-[600]">
            Projects: <span className="font-[400]">{projects.length}</span>
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/edit-details/${userData.id}`)}
            className="bg-[#1E3A5F] border border-white text-white px-3 py-1 rounded-lg text-sm flex items-center"
          >
            <Edit size={16} className="mr-1" /> Edit
          </button>
          <button className="bg-[#FB0000] border border-[#FB0000] text-white px-3 py-1 rounded-lg text-sm flex items-center">
            <Trash2 size={16} className="mr-1" /> Delete
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto mt-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-white">
          <p>No projects found for this user.</p>
        </div>
      )}
    </div>
  );
}

export default function UserDetails() {
  const { userId } = useParams();
  const [userData, setUserData] = useState({});
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        if (!userId) return;

        // 1. Fetch user document
        const userSnap = await getDoc(doc(db, 'users', userId));
        if (!userSnap.exists()) {
          console.error('User not found');
          return;
        }
        const u = userSnap.data();
        setUserData({
          id: userId,
          name: u.name || 'Unknown',
          email: u.email || '',
          role: u.type || 'User',
        });

        // 2. Fetch projects and get download URLs
        const q = query(
          collection(db, 'projects'),
          where('creatorID', '==', userId)
        );
        const snap = await getDocs(q);
        const storage = getStorage();

        const projList = await Promise.all(
          snap.docs.map(async (docSnap) => {
            const data = docSnap.data();
            let downloadUrl = null;

            if (data.usdFileUrl) {
              try {
                // Get the download URL without modifying the content type
                downloadUrl = await getDownloadURL(
                  storageRef(storage, data.usdFileUrl)
                );
              } catch (e) {
                console.warn('Could not load model URL:', e);
              }
            }

            return {
              id: docSnap.id,
              name: data.name || 'Unnamed Project',
              description: data.description || '',
              usdFileUrl: downloadUrl, // Pass the download URL directly
            };
          })
        );

        setProjects(projList);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  return (
    <div className="flex min-h-screen h-full bg-black text-white">
      <SideBar />
      <div className="flex-1 p-6">
        <TopBar />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-[500]">User Details</h1>
          <button
            onClick={() => navigate('/users-management')}
            className="bg-[#1E3A5F] text-white py-2 px-4 rounded-md"
          >
            Back to Users
          </button>
        </div>
        <FacilityDashboard
          userData={userData}
          projects={projects}
          loading={loading}
        />
      </div>
    </div>
  );
}