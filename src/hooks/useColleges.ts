import { useState, useEffect } from 'react';
import {
  College,
  getAllColleges,
  getActiveColleges,
  getCollegeById,
  getCollegeByCode,
  createCollege,
  updateCollege,
  deleteCollege,
  getCollegesByState,
  getCollegesByTier,
  getCollegeStats,
  searchColleges
} from '../services/firebase/colleges.service';

export const useColleges = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllColleges();
      setColleges(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch colleges');
      console.error('Error fetching colleges:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveColleges = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getActiveColleges();
      setColleges(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch active colleges');
      console.error('Error fetching active colleges:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCollege = async (collegeData: Omit<College, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const collegeId = await createCollege(collegeData);
      await fetchColleges(); // Refresh list
      return collegeId;
    } catch (err: any) {
      setError(err.message || 'Failed to create college');
      console.error('Error creating college:', err);
      throw err;
    }
  };

  const modifyCollege = async (collegeId: string, updates: Partial<College>) => {
    try {
      setError(null);
      await updateCollege(collegeId, updates);
      await fetchColleges(); // Refresh list
    } catch (err: any) {
      setError(err.message || 'Failed to update college');
      console.error('Error updating college:', err);
      throw err;
    }
  };

  const removeCollege = async (collegeId: string) => {
    try {
      setError(null);
      await deleteCollege(collegeId);
      await fetchColleges(); // Refresh list
    } catch (err: any) {
      setError(err.message || 'Failed to delete college');
      console.error('Error deleting college:', err);
      throw err;
    }
  };

  const getCollege = async (collegeId: string) => {
    try {
      setError(null);
      return await getCollegeById(collegeId);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch college');
      console.error('Error fetching college:', err);
      throw err;
    }
  };

  const findCollegeByCode = async (code: string) => {
    try {
      setError(null);
      return await getCollegeByCode(code);
    } catch (err: any) {
      setError(err.message || 'Failed to find college');
      console.error('Error finding college:', err);
      throw err;
    }
  };

  const filterByState = async (state: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCollegesByState(state);
      setColleges(data);
    } catch (err: any) {
      setError(err.message || 'Failed to filter colleges');
      console.error('Error filtering colleges:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterByTier = async (tier: 'Enterprise' | 'Professional' | 'Standard') => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCollegesByTier(tier);
      setColleges(data);
    } catch (err: any) {
      setError(err.message || 'Failed to filter colleges');
      console.error('Error filtering colleges:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStats = async () => {
    try {
      setError(null);
      return await getCollegeStats();
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stats');
      console.error('Error fetching stats:', err);
      throw err;
    }
  };

  const search = async (searchTerm: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await searchColleges(searchTerm);
      setColleges(data);
    } catch (err: any) {
      setError(err.message || 'Failed to search colleges');
      console.error('Error searching colleges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  return {
    colleges,
    loading,
    error,
    fetchColleges,
    fetchActiveColleges,
    addCollege,
    modifyCollege,
    removeCollege,
    getCollege,
    findCollegeByCode,
    filterByState,
    filterByTier,
    getStats,
    search
  };
};
