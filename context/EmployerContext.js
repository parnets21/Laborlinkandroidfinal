import React, { createContext, useState, useContext } from 'react';

const EmployerContext = createContext();

export const useEmployer = () => {
  const context = useContext(EmployerContext);
  if (!context) {
    throw new Error('useEmployer must be used within an EmployerProvider');
  }
  return context;
};

export const EmployerProvider = ({ children }) => {
  const [employerData, setEmployerData] = useState({
    employerId: '',
    mobile: '',
    profile: '',
    age: '',
    name: '',
    userName: '',
    email: '',
    password: '',
    gender: '',
    // Company details
    hiring: '',
    MyCompany: '',
    CompanyName: '',
    companyWebsite: '',
    address: '',
    numberOfemp: '',
    industry: '',
    CompanyInd: '',
    CompanydocType: '',
    GstNum: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    isApproved: false, // Added to track admin approval
    isAuthenticated: false,
  });

  const updateEmployerData = (newData) => {
    setEmployerData(prevData => ({
      ...prevData,
      ...newData
    }));
  };

  const clearEmployerData = () => {
    setEmployerData({
      mobile: '',
      profile: '',
      age: '',
      name: '',
      userName: '',
      email: '',
      password: '',
      gender: '',
      hiring: '',
      MyCompany: '',
      CompanyName: '',
      companyWebsite: '',
      address: '',
      numberOfemp: '',
      industry: '',
      CompanyInd: '',
      CompanydocType: '',
      GstNum: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: '',
      isAuthenticated: false,
      isApproved: false,
    });
  };

  const fetchEmployerById = async (id) => {
    try {
      console.log('Fetching employer data for ID:', id);
      const response = await fetch(`http://localhost:8500/api/user/getEmployerById/${id}`);
      const result = await response.json();

      console.log('Fetched employer data:', result);

      if (result.success) {
        setEmployerData(prevData => ({
          ...prevData,
          ...result.data,
          employerId: id,
          isAuthenticated: true
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error fetching employer data:', error);
      return false;
    }
  };

  return (
    <EmployerContext.Provider value={{
      employerData,
      setEmployerData,
      clearEmployerData,
      fetchEmployerById
    }}>
      {children}
    </EmployerContext.Provider>
  );
}; 