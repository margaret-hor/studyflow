import { useAuth } from '../../contexts/AuthContext';

export default function Dashboard() {
  const { currentUser, userProfile, loading } = useAuth();

  const displayName = userProfile?.displayName || currentUser?.displayName || 'User';

  return (
    <div>
      <h1>Welcome back, {displayName}! 👋</h1>
      <p>Your study dashboard</p>
    </div>
  );
}