import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to demo page
    navigate("/demo");
  }, [navigate]);

  return null;
};

export default Index;
