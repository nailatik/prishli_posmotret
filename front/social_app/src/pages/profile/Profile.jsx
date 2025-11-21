import React from 'react';
import Header from '../../components/header/Header';
import ProfileCard from '../../components/header/ProfileCard';

export default function Profile() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#eff6ff",
      paddingTop: 40
    }}>
      <Header />
      <div style={{
        display: "flex",
        justifyContent: "center"
      }}>
        <ProfileCard />
      </div>
    </div>
  );
}
