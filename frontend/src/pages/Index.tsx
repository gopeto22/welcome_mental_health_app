import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to mobile app (MVP)
    navigate("/mobile");
  }, [navigate]);

  return null;
};

export default Index;
