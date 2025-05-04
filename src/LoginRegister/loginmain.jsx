import { GoogleOAuthProvider } from '@react-oauth/google';
import Sample from './Login';

const clientId = "1085235594152-36ckcmfjakumr7t4m93f9i3joe2vla7b.apps.googleusercontent.com";

function mainz() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Sample />
    </GoogleOAuthProvider>
  );
}

export default mainz;
