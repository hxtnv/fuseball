import { useEffect } from "react";
import { useParams } from "react-router-dom";

const Callback: React.FC = () => {
  const { token } = useParams();

  useEffect(() => {
    const broadcast = new BroadcastChannel("fuseball-auth");
    broadcast.postMessage(token);

    // window.close();

    return () => {
      broadcast.close();
    };
  }, [token]);

  return <div>You can close this window now</div>;
};

export default Callback;
