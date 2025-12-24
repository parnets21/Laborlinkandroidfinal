import React from 'react';
import { View, FlatList } from 'react-native';
import JobCard from '../components/JobCard';

const HomeScreen = () => {
  // Your dummy jobs data
  const jobs = [
    {
      id: 1,
      companyName: 'Google',
      title: 'Product Designer',
      location: 'California, USA',
      salary: '$120k - $150k',
      // ... other job details
    },
    // ... more jobs
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={jobs}
        renderItem={({ item }) => <JobCard job={item} />}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
};

export default HomeScreen; 