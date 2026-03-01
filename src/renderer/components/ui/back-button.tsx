import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "./button";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <Button variant="outline" onClick={() => navigate(-1)}>
      <ArrowLeft size={16} className="mr-2" />
      Back
    </Button>
  );
}
