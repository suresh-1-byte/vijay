import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';

const COLLEGES_COLLECTION = 'colleges';

export interface College {
  id?: string;
  name: string;
  code: string;
  location: string;
  state: string;
  logo?: string;
  contractStatus: 'Active' | 'Pending Renewal' | 'Onboarding';
  planTier: 'Enterprise' | 'Professional' | 'Standard';
  joinedDate: string;
  totalDepartments: number;
  totalStudents: number;
  totalMentors: number;
  placementRate: number;
  annualFee: number;
  contactPerson: string;
  contactEmail: string;
  establishedYear?: number;
  description?: string;
  website?: string;
  accreditation?: string[];
  specializations?: string[];
  facilities?: string[];
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Create a new college
 */
export const createCollege = async (collegeData: Omit<College, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLEGES_COLLECTION), {
      ...collegeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating college:', error);
    throw error;
  }
};

/**
 * Get all colleges
 */
export const getAllColleges = async (): Promise<College[]> => {
  try {
    const q = query(collection(db, COLLEGES_COLLECTION), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as College));
  } catch (error) {
    console.error('Error fetching colleges:', error);
    throw error;
  }
};

/**
 * Get active colleges only
 */
export const getActiveColleges = async (): Promise<College[]> => {
  try {
    const q = query(
      collection(db, COLLEGES_COLLECTION),
      where('contractStatus', '==', 'Active'),
      orderBy('name', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as College));
  } catch (error) {
    console.error('Error fetching active colleges:', error);
    throw error;
  }
};

/**
 * Get college by ID
 */
export const getCollegeById = async (collegeId: string): Promise<College | null> => {
  try {
    const docRef = doc(db, COLLEGES_COLLECTION, collegeId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as College;
    }
    return null;
  } catch (error) {
    console.error('Error fetching college:', error);
    throw error;
  }
};

/**
 * Get college by code
 */
export const getCollegeByCode = async (code: string): Promise<College | null> => {
  try {
    const q = query(
      collection(db, COLLEGES_COLLECTION),
      where('code', '==', code)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as College;
    }
    return null;
  } catch (error) {
    console.error('Error fetching college by code:', error);
    throw error;
  }
};

/**
 * Update college
 */
export const updateCollege = async (
  collegeId: string,
  updates: Partial<Omit<College, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, COLLEGES_COLLECTION, collegeId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating college:', error);
    throw error;
  }
};

/**
 * Delete college
 */
export const deleteCollege = async (collegeId: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLEGES_COLLECTION, collegeId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting college:', error);
    throw error;
  }
};

/**
 * Get colleges by state
 */
export const getCollegesByState = async (state: string): Promise<College[]> => {
  try {
    const q = query(
      collection(db, COLLEGES_COLLECTION),
      where('state', '==', state),
      orderBy('name', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as College));
  } catch (error) {
    console.error('Error fetching colleges by state:', error);
    throw error;
  }
};

/**
 * Get colleges by plan tier
 */
export const getCollegesByTier = async (tier: 'Enterprise' | 'Professional' | 'Standard'): Promise<College[]> => {
  try {
    const q = query(
      collection(db, COLLEGES_COLLECTION),
      where('planTier', '==', tier),
      orderBy('name', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as College));
  } catch (error) {
    console.error('Error fetching colleges by tier:', error);
    throw error;
  }
};

/**
 * Get college statistics
 */
export const getCollegeStats = async (): Promise<{
  totalColleges: number;
  activeColleges: number;
  totalStudents: number;
  totalMentors: number;
  avgPlacementRate: number;
}> => {
  try {
    const colleges = await getAllColleges();
    
    const activeColleges = colleges.filter(c => c.contractStatus === 'Active');
    const totalStudents = colleges.reduce((sum, c) => sum + (c.totalStudents || 0), 0);
    const totalMentors = colleges.reduce((sum, c) => sum + (c.totalMentors || 0), 0);
    const avgPlacementRate = colleges.length > 0
      ? colleges.reduce((sum, c) => sum + (c.placementRate || 0), 0) / colleges.length
      : 0;
    
    return {
      totalColleges: colleges.length,
      activeColleges: activeColleges.length,
      totalStudents,
      totalMentors,
      avgPlacementRate: Math.round(avgPlacementRate * 10) / 10
    };
  } catch (error) {
    console.error('Error calculating college stats:', error);
    throw error;
  }
};

/**
 * Search colleges by name
 */
export const searchColleges = async (searchTerm: string): Promise<College[]> => {
  try {
    const allColleges = await getAllColleges();
    const searchLower = searchTerm.toLowerCase();
    
    return allColleges.filter(college =>
      college.name.toLowerCase().includes(searchLower) ||
      college.code.toLowerCase().includes(searchLower) ||
      college.location.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error('Error searching colleges:', error);
    throw error;
  }
};
