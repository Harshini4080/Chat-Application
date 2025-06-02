import axios from 'axios';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  logout,
  setOnlineUser,
  setSocketConnection,
  setUser,
} from '../redux/userSlice';
import Sidebar from '../components/Sidebar';
import logo from '../assets/logo.webp';
import io from 'socket.io-client';

const Home = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('user', user);

  // Fetch user details
  const fetchUserDetails = async () => {
    try {
      const URL = `${process.env.REACT_APP_BACKEND_URL}/api/user-details`;
      const response = await axios.get(URL, {
        withCredentials: true,
      });

      dispatch(setUser(response.data.data));

      if (response.data.data.logout) {
        dispatch(logout());
        navigate('/email');
      }

      console.log('Current user details', response);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  // Fetch user once on mount
  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Establish socket connection
  useEffect(() => {
    const socketConnection = io(process.env.REACT_APP_SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token'),
      },
      withCredentials: true,
    });

    socketConnection.on('onlineUser', (data) => {
      console.log('Online users:', data);
      dispatch(setOnlineUser(data));
    });

    dispatch(setSocketConnection(socketConnection));

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const basePath = location.pathname === '/';

  return (
    <div className='grid lg:grid-cols-[300px,1fr] h-screen max-h-screen'>
      {/* Sidebar */}
      <section className={`bg-white ${!basePath && 'hidden'} lg:block`}>
        <Sidebar />
      </section>

      {/* Chat Outlet */}
      <section className={`${basePath && 'hidden'}`}>
        <Outlet />
      </section>

      {/* Welcome Panel */}
      <div
        className={`justify-center items-center flex-col gap-2 hidden ${
          !basePath ? 'hidden' : 'lg:flex'
        }`}
      >
        <img src={logo} width={200} alt='logo' />
        <p className='text-lg mt-2 text-slate-500'>Select user to send message</p>
      </div>
    </div>
  );
};

export default Home;
