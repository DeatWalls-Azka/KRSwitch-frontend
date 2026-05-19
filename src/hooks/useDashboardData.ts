import { useState, useEffect, useRef } from 'react';
import { getUsers, getClasses, getEnrollments, getOffers, getNotifications } from '../api';
import { useAuth } from '../context/AuthContext';
import type { User, ParallelClass, Enrollment, Offer, Notification } from '../types';

export function useDashboardData() {
  const [users, setUsers] = useState<User[]>([]);
  const [parallelClasses, setParallelClasses] = useState<ParallelClass[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const { user: currentUser } = useAuth();
  const [apiOffers, setApiOffers] = useState<Offer[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Refs biar socket handler bisa baca data terkini tanpa stale closure
  const usersRef = useRef<User[]>([]);
  const parallelClassesRef = useRef<ParallelClass[]>([]);
  
  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  useEffect(() => {
    parallelClassesRef.current = parallelClasses;
  }, [parallelClasses]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [usersRes, classesRes, enrollmentsRes, offersRes, notificationsRes] =
          await Promise.all([
            getUsers(),
            getClasses(),
            getEnrollments(),
            getOffers(),
            getNotifications(),
          ]);
        setUsers(usersRes.data);
        setParallelClasses(classesRes.data);
        setEnrollments(enrollmentsRes.data);
        setApiOffers(offersRes.data);
        setNotifications(notificationsRes.data);
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return {
    users,
    parallelClasses,
    enrollments,
    setEnrollments,
    currentUser,
    apiOffers,
    setApiOffers,
    notifications,
    setNotifications,
    loading,
    usersRef,
    parallelClassesRef,
  };
}
