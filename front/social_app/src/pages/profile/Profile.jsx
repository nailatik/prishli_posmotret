import React from 'react';
import Header from '../../components/header/Header';
import ProfileCard from '../../components/profile/ProfileCard';
import './profile.css'
export default function Profile() {
  return (
    <div>
      <Header />
      <div style={{
        display: "flex",
        justifyContent: "center"
      }} >
        <ProfileCard />
      </div>
    </div>
  );
}
